import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function TokenDebug() {
  const { user, logout } = useContext(AuthContext);

  if (!user || !user.token) {
    return <p className="text-red-600 text-center">❌ Kein Token vorhanden (nicht eingeloggt)</p>;
  }

  const decoded = parseJwt(user.token);

  if (!decoded) {
    return <p className="text-red-600 text-center">⚠️ Ungültiger Token</p>;
  }

  return (
    <div className="bg-gray-100 p-4 border rounded mt-4 text-sm">
      <h3 className="text-lg font-semibold mb-2">🧪 Token Debug</h3>
      <p><strong>User ID:</strong> {decoded.userId || 'Unbekannt'}</p>
      <p><strong>Ablauf:</strong> {decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'Unbekannt'}</p>
      <p className="break-all"><strong>Token:</strong> {user.token}</p>
      <button onClick={logout} className="mt-2 bg-red-500 text-white px-3 py-1 rounded">
        Logout (Token löschen)
      </button>
    </div>
  );
}

export default TokenDebug;
