import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const categories = [
  'Fahrzeuge', 'Elektronik', 'Haushalt',
  'Freizeit', 'Kleidung', 'Immobilien', 'Dienstleistungen',
];

function CreateAd() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '',
    zipCode: '', location: '', street: '', houseNumber: '',
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'zipCode' && value.length === 5) fetchLocationSuggestions(value);
  };

  const fetchLocationSuggestions = async (zip) => {
    setLoadingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=Germany&format=json&addressdetails=1&limit=5`, {
        headers: { 'User-Agent': 'Kleinanzeigen-App (deine-email@domain.de)' }
      });
      const data = await res.json();
      const suggestions = data.map(item =>
        item.address?.city || item.address?.town || item.address?.village || item.display_name
      ).filter((v, i, a) => v && a.indexOf(v) === i);
      setLocationSuggestions(suggestions);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleLocationSelect = loc => {
    setForm(prev => ({ ...prev, location: loc }));
    setLocationSuggestions([]);
  };

  const handleImageChange = e => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    images.forEach(file => formData.append('images', file));

    try {
      const res = await fetch('http://localhost:5000/api/ads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/ads/${data._id}`);
      } else {
        setMessage(data.error || 'Fehler beim Erstellen');
      }
    } catch {
      setMessage('Serverfehler');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Neue Anzeige erstellen</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" encType="multipart/form-data">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Titel" required className="border p-2 rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Beschreibung" rows={4} className="border p-2 rounded" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Preis (€)" required className="border p-2 rounded" />
        <select name="category" value={form.category} onChange={handleChange} required className="border p-2 rounded">
          <option value="">Kategorie wählen</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="PLZ" required className="border p-2 rounded" />
        {loadingLocation && <p>Orte werden geladen...</p>}
        {locationSuggestions.length > 0 && (
          <ul className="border p-2 rounded bg-white">
            {locationSuggestions.map(loc => (
              <li key={loc} onClick={() => handleLocationSelect(loc)} className="cursor-pointer hover:bg-gray-100 p-1">{loc}</li>
            ))}
          </ul>
        )}
        <input name="location" value={form.location} onChange={handleChange} placeholder="Ort" required className="border p-2 rounded" />
        <input name="street" value={form.street} onChange={handleChange} placeholder="Straße (optional)" className="border p-2 rounded" />
        <input name="houseNumber" value={form.houseNumber} onChange={handleChange} placeholder="Hausnummer (optional)" className="border p-2 rounded" />
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Anzeige erstellen</button>
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default CreateAd;
