import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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

  const handleStartChat = async () => {
    if (!user) {
      alert('Bitte zuerst einloggen, um Nachrichten zu senden.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ recipientId: ad.userId }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/chat', { state: { chatId: data._id } });
      } else {
        alert(data.error || 'Fehler beim Erstellen des Chats');
      }
    } catch {
      alert('Serverfehler beim Erstellen des Chats');
    }
  };

  if (loading) return <p className="text-center mt-10">Lade Anzeige...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const imageUrl = ad.image ? `http://localhost:5000/uploads/${ad.image}` : null;
  const coords = ad.latitude && ad.longitude ? [ad.latitude, ad.longitude] : null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link to="/" className="text-blue-600 underline mb-4 inline-block">
        ← Zurück zur Übersicht
      </Link>
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

      {user?.id !== ad.userId && (
        <button
          onClick={handleStartChat}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Nachricht schreiben
        </button>
      )}

      {coords ? (
        <MapContainer
          center={coords}
          zoom={13}
          style={{ height: '300px', width: '100%', marginTop: '1rem' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap-Mitwirkende"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}>
            <Popup>
              <strong>{ad.title}</strong><br />
              {ad.street && `${ad.street} `}
              {ad.houseNumber && `${ad.houseNumber}, `}
              {ad.location}
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p className="text-sm mt-4 text-gray-500">Keine Koordinaten verfügbar.</p>
      )}
    </div>
  );
}

export default AdDetails;
