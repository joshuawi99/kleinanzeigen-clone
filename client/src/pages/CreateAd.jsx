import { useState, useContext } from 'react';
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

function CreateAd() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    zipCode: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [locationPreview, setLocationPreview] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'zipCode') {
      fetchLocationFromZip(value);
    }
  };

  const fetchLocationFromZip = async (zip) => {
    if (zip.length !== 5) return setLocationPreview('');
    try {
      const res = await fetch(`https://api.zippopotam.us/de/${zip}`);
      if (!res.ok) throw new Error('Ungültige PLZ');
      const data = await res.json();
      const city = data.places?.[0]['place name'] || '';
      setLocationPreview(city);
    } catch (err) {
      setLocationPreview('Unbekannt');
    }
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
      const res = await fetch('http://localhost:5000/api/ads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Anzeige erfolgreich erstellt!');
        setForm({ title: '', description: '', price: '', category: '', zipCode: '' });
        setLocationPreview('');
        setImage(null);
      } else {
        setMessage(data.error || 'Fehler beim Erstellen');
      }
    } catch (err) {
      setMessage('Serverfehler');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Neue Anzeige erstellen</h2>
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
        <div>
          <input
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
            placeholder="PLZ (z. B. 50667)"
            className="border p-2 rounded w-full"
            required
          />
          {locationPreview && (
            <p className="text-sm text-gray-500 mt-1 ml-1">
              ➡ Ort: <strong>{locationPreview}</strong>
            </p>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Anzeige erstellen
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default CreateAd;
