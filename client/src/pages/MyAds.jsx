import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdCard from '../components/AdCard';

export default function MyAds() {
  const { user } = useContext(AuthContext);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:5000/api/ads/my', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Fehler beim Abrufen der Anzeigen');
        }
        return res.json();
      })
      .then(data => setAds(data))
      .catch(err => console.error('Fehler beim Laden:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Anzeige wirklich löschen?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setAds(prev => prev.filter(ad => ad._id !== id));
      } else {
        alert('Fehler beim Löschen der Anzeige');
      }
    } catch {
      alert('Fehler beim Löschen');
    }
  };

  if (loading) return <p className="text-center mt-10">Lade Anzeigen...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meine Anzeigen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.length > 0 ? (
          ads.map(ad => (
            <AdCard key={ad._id} ad={ad} onDelete={handleDelete} />
          ))
        ) : (
          <p>Keine Anzeigen gefunden.</p>
        )}
      </div>
    </div>
  );
}
