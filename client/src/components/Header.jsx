import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">
      <Link to="/" className="font-bold">Kleinanzeigen</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <Link to="/mein-profil" className="hover:underline">
              Mein Profil
            </Link>
            <Link to="/meine-anzeigen" className="hover:underline">
              Meine Anzeigen
            </Link>
            <button
              onClick={logout}
              className="text-red-300 hover:text-red-500 ml-4"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Registrieren</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
