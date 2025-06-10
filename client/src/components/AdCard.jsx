import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdCard({ ad, onDelete }) {
  const { user } = useContext(AuthContext);

  const hasMultipleImages = Array.isArray(ad.images) && ad.images.length > 0;
  const imageUrl = hasMultipleImages
    ? `http://localhost:5000/uploads/${ad.images[0]}`
    : ad.image
    ? `http://localhost:5000/uploads/${ad.image}`
    : null;

  const isOwner = user?.id && ad.userId && String(user.id) === String(ad.userId);

  return (
    <div className="bg-white border rounded shadow-md overflow-hidden flex flex-col transition hover:shadow-lg">
      <Link to={`/ads/${ad._id}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            Kein Bild vorhanden
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">
            <Link to={`/ads/${ad._id}`} className="hover:underline">
              {ad.title}
            </Link>
          </h3>
          <p className="text-green-600 font-semibold text-lg mb-2">{ad.price} €</p>
          <p className="text-sm text-gray-500">
            📍 {ad.street || '–'}, {ad.zipCode || ''} {ad.location || ''}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2 mt-4">
            <Link
              to={`/ads/edit/${ad._id}`}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Bearbeiten
            </Link>
            <button
              onClick={() => onDelete(ad._id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
