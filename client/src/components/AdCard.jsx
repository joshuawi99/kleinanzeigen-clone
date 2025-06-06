import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdCard({ ad }) {
  const { user } = useContext(AuthContext);
  const imageUrl = ad.image
    ? `http://localhost:5000/uploads/${ad.image}`
    : null;

  const isOwner = user?.id && ad.userId && String(user.id) === String(ad.userId);

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <h2 className="text-xl font-semibold">{ad.title}</h2>
      <p className="text-gray-600 mb-2">{ad.description}</p>
      <p className="text-green-700 font-bold">{ad.price} €</p>
      <p className="text-sm text-gray-500">📍 {ad.location || 'Unbekannt'}</p>

      {isOwner && (
        <Link
          to={`/ads/edit/${ad._id}`}
          className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Bearbeiten
        </Link>
      )}
    </div>
  );
}

export default AdCard;
