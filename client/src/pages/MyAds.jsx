import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdCard from '../components/AdCard';

function MyAds() {
  const { user } = useContext(AuthContext);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/ads/my', {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-center mt-10">Lade deine Anzeigen...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">Meine Anzeigen</h1>
      {ads.length === 0 ? (
        <p className="text-center">Du hast noch keine Anzeigen erstellt.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map(ad => (
            <AdCard key={ad._id} ad={ad} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAds;
