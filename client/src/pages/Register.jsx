import { useState } from 'react';

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Erfolgreich registriert!');
        setForm({ firstName: '', lastName: '', email: '', password: '' });
      } else {
        setMessage(data.error || 'Fehler bei der Registrierung');
      }
    } catch {
      setMessage('Serverfehler');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Registrierung</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Vorname" className="border p-2" />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nachname" className="border p-2" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-Mail" className="border p-2" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Passwort" className="border p-2" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Registrieren</button>
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default Register;
