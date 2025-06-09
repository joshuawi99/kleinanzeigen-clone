import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell'; // ✅

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Kleinanzeigen</Link>

      <nav className="flex items-center gap-4">
        <Link to="/">Home</Link>
        {user && <Link to="/create">Neue Anzeige</Link>}
        {user && <Link to="/my-ads">Meine Anzeigen</Link>}
        {user && <NotificationBell />} {/* ✅ Hier ist die Glocke */}

        {user && (
          <Link
            to="/profile"
            className="rounded-full overflow-hidden hover:ring-2 hover:ring-white transition"
            title="Zum Profil"
          >
            <Avatar firstName={user.firstName} lastName={user.lastName} size={8} />
          </Link>
        )}

        {user ? (
          <button onClick={logout} className="bg-red-500 px-2 py-1 rounded text-sm">Logout</button>
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
