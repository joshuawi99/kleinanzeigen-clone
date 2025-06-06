import { useEffect, useState, useContext } from 'react';
import { fetchAds } from '../services/api';
import AdCard from '../components/AdCard';
import TokenDebug from '../components/TokenDebug'; // 🧪
import { AuthContext } from '../context/AuthContext';

// Hilfsfunktion: Nur den Ort aus der kompletten Adresse extrahieren
function extractCity(fullLocation) {
  if (!fullLocation) return '';
  const parts = fullLocation.split(',').map(p => p.trim());
  return parts.length > 0 ? parts[parts.length - 1] : fullLocation;
}

function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortOption, setSortOption] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAds()
      .then(data => setAds(data))
      .catch(err => console.error('Fehler beim Laden der Anzeigen:', err))
      .finally(() => setLoading(false));
  }, []);

  // Erstelle eine Liste mit einzigartigen Städten aus den Anzeigen
  const uniqueCities = Array.from(new Set(ads.map(ad => extractCity(ad.location))))
    .filter(city => city);

  // Filtere Anzeigen anhand Kategorie und Ort (nur Stadt)
  const filteredAds = ads
    .filter(ad =>
      (filterCategory ? ad.category === filterCategory : true) &&
      (filterLocation ? extractCity(ad.location) === filterLocation : true)
    )
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt); // Neueste zuerst
    });

  const handleDelete = (deletedId) => {
    setAds(prevAds => prevAds.filter(ad => ad._id !== deletedId));
  };

  if (loading) return <p className="text-center mt-10">Lade Anzeigen...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">Kleinanzeigen</h1>

      {/* 🔍 Filter- und Sortierleiste */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 justify-center mb-6">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Alle Kategorien</option>
          {Array.from(new Set(ads.map(ad => ad.category)))
            .filter(cat => cat)
            .map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>

        <select
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Alle Orte</option>
          {uniqueCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Neueste zuerst</option>
          <option value="price-asc">Preis: aufsteigend</option>
          <option value="price-desc">Preis: absteigend</option>
        </select>
      </div>

      {/* 🖼️ Anzeigenliste */}
      {filteredAds.length === 0 ? (
        <p className="text-center">Keine Anzeigen gefunden.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAds.map(ad => (
            <AdCard key={ad._id} ad={ad} onDelete={handleDelete} user={user} />
          ))}
        </div>
      )}

      {/* 🧪 Debug-Token-Anzeige */}
      <TokenDebug />
    </div>
  );
}

export default Home;
