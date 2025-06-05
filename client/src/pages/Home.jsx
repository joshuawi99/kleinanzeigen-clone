import { useEffect, useState } from 'react';
import { fetchAds } from '../services/api';

function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds()
      .then(data => setAds(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Lade Anzeigen...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Kleinanzeigen</h1>
      {ads.length === 0 ? (
        <p>Keine Anzeigen gefunden.</p>
      ) : (
        <ul>
          {ads.map(ad => (
            <li key={ad._id}>
              <strong>{ad.title}</strong> – {ad.price} €
              <p>{ad.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
