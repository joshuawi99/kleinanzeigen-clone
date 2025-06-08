import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">Kleinanzeigen</Link>
      <nav className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/create">Neue Anzeige</Link>
            <Link to="/meine-anzeigen">Meine Anzeigen</Link>
            <Link to="/mein-profil">Mein Profil</Link>
            <Link to="/chat">Meine Chats</Link> {/* 👈 NEU */}
            <button onClick={logout} className="bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registrieren</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
