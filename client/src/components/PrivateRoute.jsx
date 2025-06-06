import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="text-center mt-10">Prüfe Login-Status...</p>;

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
