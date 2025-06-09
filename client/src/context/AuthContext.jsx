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
  const now = Date.now() / 1000;
  return decoded.exp < now;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    if (token && firstName && lastName) {
      if (isTokenExpired(token)) {
        localStorage.clear();
        setUser(null);
      } else {
        const decoded = decodeJwt(token);
        const id = decoded.userId || decoded.id || decoded._id || decoded.sub;
        setUser({ token, firstName, lastName, id });
      }
    }
    setLoading(false);
  }, []);

  // Login-Aufruf z. B. nach erfolgreichem Login-Request
  const login = (token, firstName, lastName) => {
    if (isTokenExpired(token)) {
      setUser(null);
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);

    const decoded = decodeJwt(token);
    const id = decoded.userId || decoded.id || decoded._id || decoded.sub;

    setUser({ token, firstName, lastName, id });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return <p className="text-center mt-10">Lade Benutzerstatus...</p>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
