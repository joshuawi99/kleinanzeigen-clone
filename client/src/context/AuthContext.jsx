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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      const decoded = decodeJwt(token);

      if (decoded) {
        const id = decoded.userId || decoded.id || decoded._id || decoded.sub;
        setUser({ token, username, id });
      } else {
        setUser({ token, username });
      }
    }
    setLoading(false);
  }, []);

  const login = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);

    const decoded = decodeJwt(token);

    if (decoded) {
      const id = decoded.userId || decoded.id || decoded._id || decoded.sub;
      setUser({ token, username, id });
    } else {
      setUser({ token, username });
    }
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
