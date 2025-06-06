import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdCard({ ad, onDelete }) {
  const { user } = useContext(AuthContext);
  const imageUrl = ad.image
    ? `http://localhost:5000/uploads/${ad.image}`
    : null;

  const isOwner = user?.id && ad.userId && String(user.id) === String(ad.userId);

  const handleDelete = async () => {
    if (!window.confirm('Möchtest du diese Anzeige wirklich löschen?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/ads/${ad._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        if (onDelete) {
          onDelete(ad._id);
        }
      } else {
        alert('Fehler beim Löschen der Anzeige');
      }
    } catch {
      alert('Serverfehler beim Löschen');
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <h2 className="text-xl font-semibold">
        <Link to={`/ads/${ad._id}`} className="hover:underline">
          {ad.title}
        </Link>
      </h2>
      <p className="text-gray-600 mb-2">{ad.description}</p>
      <p className="text-green-700 font-bold">{ad.price} €</p>
      <p className="text-sm text-gray-500">📍 {ad.location || 'Unbekannt'}</p>

      {isOwner && (
        <>
          <Link
            to={`/ads/edit/${ad._id}`}
            className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Bearbeiten
          </Link>
          <button
            onClick={handleDelete}
            className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded"
          >
            Löschen
          </button>
        </>
      )}
    </div>
  );
}

export default AdCard;
