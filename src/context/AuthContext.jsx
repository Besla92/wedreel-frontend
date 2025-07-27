// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, isTokenExpired } from '../services/auth';
import axiosInstance from '../services/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = getToken();
        return token && !isTokenExpired(token);
    });

    const [user, setUser] = useState(() => {
        try {
            const userData = localStorage.getItem('user');
            return userData && userData !== 'undefined' ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Fehler beim Parsen von user in localStorage:', e);
            return null;
        }
    });

    const [event, setEvent] = useState(null);

    // 🌀 Token Refresh alle 60s prüfen
    useEffect(() => {
        const interval = setInterval(() => {
            const token = getToken();
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000;
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (exp - now < fiveMinutes) {
                axiosInstance.post('/api/token/refresh', {}, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }).then(response => {
                    localStorage.setItem('token', response.data.token);
                    setIsAuthenticated(true);
                }).catch(() => {
                    logout();
                });
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // 📡 Event laden beim Login oder Auth-Wechsel
    useEffect(() => {
        const fetchEvent = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const response = await axiosInstance.get('/api/my-event', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvent(response.data);
            } catch (err) {
                console.error('Fehler beim Laden des Events:', err);
            }
        };

        if (isAuthenticated) {
            fetchEvent();
        }
    }, [isAuthenticated]);

    // ✅ Login
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    // 🚪 Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setEvent(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user, event }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
