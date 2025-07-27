import { Navigate } from 'react-router-dom';
import { getToken, isTokenExpired } from '../services/auth';

const PrivateRoute = ({ children }) => {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
