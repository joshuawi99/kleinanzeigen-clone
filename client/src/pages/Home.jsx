import { useEffect, useState } from 'react';
import { fetchAds } from '../services/api';
import AdCard from '../components/AdCard';
import TokenDebug from '../components/TokenDebug'; // 🧪

function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchAds()
      .then(data => setAds(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAds = ads
    .filter(ad =>
      (filterCategory ? ad.category === filterCategory : true) &&
      (filterLocation ? ad.location === filterLocation : true)
    )
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt); // Neueste zuerst
    });

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
          {Array.from(new Set(ads.map(ad => ad.category))).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Alle Orte</option>
          {Array.from(new Set(ads.map(ad => ad.location))).map(loc => (
            <option key={loc} value={loc}>{loc}</option>
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
            <AdCard key={ad._id} ad={ad} />
          ))}
        </div>
      )}

      {/* 🧪 Debug-Token-Anzeige */}
      <TokenDebug />
    </div>
  );
}

export default Home;
