import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">
      <Link to="/" className="font-bold">Kleinanzeigen</Link>
      <div className="flex gap-4">
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <button onClick={logout} className="text-red-300 hover:text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registrieren</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
