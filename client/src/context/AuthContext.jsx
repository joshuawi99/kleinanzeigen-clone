import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const now = Date.now() / 1000; // in Sekunden
  return decoded.exp < now;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      if (isTokenExpired(token)) {
        // Token abgelaufen → ausloggen
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
      } else {
        const decoded = decodeJwt(token);
        const id = decoded.userId || decoded.id || decoded._id || decoded.sub;
        setUser({ token, username, id });
      }
    }
    setLoading(false);
  }, []);

  const login = (token, username) => {
    if (isTokenExpired(token)) {
      // Falls beim Login schon abgelaufen, nicht speichern
      setUser(null);
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);

    const decoded = decodeJwt(token);
    const id = decoded.userId || decoded.id || decoded._id || decoded.sub;
    setUser({ token, username, id });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (loading) return <p className="text-center mt-10">Lade Benutzerstatus...</p>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
