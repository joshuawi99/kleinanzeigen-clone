import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const categories = [
  'Fahrzeuge',
  'Elektronik',
  'Haushalt',
  'Freizeit',
  'Kleidung',
  'Immobilien',
  'Dienstleistungen',
];

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    zipCode: '',
    location: '',
    street: '',
    houseNumber: '',
    city: '', // NEU
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Bestehende Anzeige laden
    fetch(`http://localhost:5000/api/ads/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Anzeige nicht gefunden');
        return res.json();
      })
      .then(data => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || '',
          zipCode: data.zipCode || '',
          location: data.location || '',
          street: data.street || '',
          houseNumber: data.houseNumber || '',
          city: data.city || '', // NEU
        });
      })
      .catch(err => setMessage(err.message));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if ((name === 'zipCode' && value.length === 5) || name === 'city') {
      fetchLocationSuggestions(name === 'zipCode' ? value : null, name === 'city' ? value : null);
    }
  };

  const fetchLocationSuggestions = async (zip, cityName) => {
    setLoadingLocation(true);
    try {
      let url = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&country=Germany';
      if (zip) url += `&postalcode=${zip}`;
      if (cityName) url += `&city=${encodeURIComponent(cityName)}`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Kleinanzeigen-App (deine-email@domain.de)' }
      });
      if (!res.ok) throw new Error('Fehler beim Laden der Orte');
      const data = await res.json();

      const suggestions = data.map(item => {
        const addr = item.address || {};
        return addr.city || addr.town || addr.village || item.display_name;
      }).filter((v, i, a) => v && a.indexOf(v) === i);

      setLocationSuggestions(suggestions);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleLocationSelect = (loc) => {
    setForm(prev => ({ ...prev, location: loc, city: loc }));
    setLocationSuggestions([]);
  };

  const handleImageChange = e => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`http://localhost:5000/api/ads/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Anzeige erfolgreich aktualisiert!');
        setTimeout(() => navigate(`/ads/${id}`), 1500);
      } else {
        setMessage(data.error || 'Fehler beim Aktualisieren');
      }
    } catch (err) {
      setMessage('Serverfehler');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to={`/ads/${id}`} className="text-blue-600 underline mb-4 inline-block">← Zurück zur Anzeige</Link>
      <h2 className="text-2xl font-bold mb-4">Anzeige bearbeiten</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" encType="multipart/form-data">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titel"
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Beschreibung"
          className="border p-2 rounded"
          rows={4}
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Preis in €"
          className="border p-2 rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Kategorie wählen</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          name="zipCode"
          value={form.zipCode}
          onChange={handleChange}
          placeholder="PLZ (z. B. 50667)"
          className="border p-2 rounded"
          required
        />

        {loadingLocation && <p className="text-sm text-gray-500">Orte werden geladen...</p>}
        {locationSuggestions.length > 0 && (
          <ul className="border p-2 rounded max-h-40 overflow-auto bg-white">
            {locationSuggestions.map(loc => (
              <li
                key={loc}
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => handleLocationSelect(loc)}
              >
                {loc}
              </li>
            ))}
          </ul>
        )}

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Ort"
          className="border p-2 rounded"
          required
        />
        <input
          name="street"
          value={form.street}
          onChange={handleChange}
          placeholder="Straße (optional)"
          className="border p-2 rounded"
        />
        <input
          name="houseNumber"
          value={form.houseNumber}
          onChange={handleChange}
          placeholder="Hausnummer (optional)"
          className="border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Anzeige aktualisieren
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default EditAd;
