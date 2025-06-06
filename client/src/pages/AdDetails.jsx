import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function AdDetails() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/ads/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Anzeige nicht gefunden');
        return res.json();
      })
      .then(data => setAd(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10">Lade Anzeige...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const imageUrl = ad.image ? `http://localhost:5000/uploads/${ad.image}` : null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/" className="text-blue-600 underline mb-4 inline-block">← Zurück zur Übersicht</Link>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full max-h-96 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
      <p className="text-gray-600 mb-4">{ad.description}</p>
      <p className="text-xl font-semibold mb-2">{ad.price} €</p>
      <p className="text-sm text-gray-500 mb-1">Kategorie: {ad.category}</p>
      <p className="text-sm text-gray-500 mb-1">Ort: {ad.location}</p>
      <p className="text-sm text-gray-500 mb-1">PLZ: {ad.zipCode}</p>
      {/* Hier kannst du noch mehr Details ergänzen */}
    </div>
  );
}

export default AdDetails;
