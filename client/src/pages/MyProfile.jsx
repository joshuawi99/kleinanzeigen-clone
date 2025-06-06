import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyProfile() {
  const { user, logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:5000/api/users/me', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Fehler beim Laden des Profils');
        return res.json();
      })
      .then(data => {
        setForm({ username: data.username || '', email: data.email || '', password: '', passwordConfirm: '' });
      })
      .catch(err => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password && form.password !== form.passwordConfirm) {
      setMessage('Passwörter stimmen nicht überein.');
      return;
    }
    const updateData = {
      username: form.username,
      email: form.email,
    };
    if (form.password) updateData.password = form.password;

    try {
      const res = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profil erfolgreich aktualisiert.');
        if (data.username && data.username !== user.username) {
          logout(); // bei Username-Änderung neu einloggen lassen
        }
      } else {
        setMessage(data.error || 'Fehler beim Aktualisieren');
      }
    } catch {
      setMessage('Serverfehler');
    }
  };

  if (loading) return <p className="text-center mt-10">Lade Profil...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mein Profil</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Benutzername"
          className="border p-2 rounded"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="E-Mail"
          className="border p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Neues Passwort (optional)"
          className="border p-2 rounded"
        />
        <input
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="Passwort bestätigen"
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Profil aktualisieren
        </button>
        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default MyProfile;
