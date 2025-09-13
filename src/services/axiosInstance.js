import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? '' : API_URL || '' , // Ersetze dies durch deine API-Basis-URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Füge einen Response-Interceptor hinzu
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token ist ungültig oder abgelaufen
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login'; // Weiterleitung zur Login-Seite
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
