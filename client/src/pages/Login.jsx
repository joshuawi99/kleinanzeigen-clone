import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext); // 👈 NEU

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.firstName, data.lastName);
        setMessage('Login erfolgreich!');
      } else {
        setMessage(data.error || 'Fehler beim Login');
      }
    } catch (err) {
      setMessage('Serverfehler');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-Mail" className="border p-2" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Passwort" className="border p-2" />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">Login</button>
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default Login;
