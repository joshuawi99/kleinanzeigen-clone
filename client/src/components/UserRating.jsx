import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserRating = ({ userId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Prüfen, ob Nutzer schon bewertet wurde
  useEffect(() => {
    const alreadyRated = localStorage.getItem(`rated_${userId}`);
    if (alreadyRated) {
      setSubmitted(true);
      setMessage('Du hast diesen Nutzer bereits bewertet.');
    }
  }, [userId]);

  const handleStarClick = (value) => {
    if (!submitted) setRating(value);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht eingeloggt.');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/users/${userId}/rate`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.setItem(`rated_${userId}`, 'true'); // ✅ merken
      setSubmitted(true);
      setMessage('Danke für deine Bewertung!');
      setError('');

      if (onRated) onRated();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Bewertung fehlgeschlagen';
      setError(msg);
      if (msg.includes('bereits bewertet')) {
        localStorage.setItem(`rated_${userId}`, 'true'); // nachträglich merken
        setSubmitted(true);
        setMessage('Du hast diesen Nutzer bereits bewertet.');
        if (onRated) onRated();
      }
    }
  };

  return (
    <div className="p-4 border rounded shadow-md w-fit">
      <h3 className="text-lg font-semibold mb-2">Nutzer bewerten:</h3>
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleStarClick(star)}
            className={`cursor-pointer text-2xl ${
              star <= rating ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {!submitted ? (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          Absenden
        </button>
      ) : (
        <p className="text-green-600 font-medium">✔ {message}</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default UserRating;
