import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" />;

    const userRoles = user?.roles || [];

    const hasAccess = allowedRoles.some(role => userRoles.includes(role));

    if (!hasAccess) return <Navigate to="/" />;

    return children;
};

export default RoleRoute;
