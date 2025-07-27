import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Container, Button
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../context/AuthContext';

export default function ConfirmEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth(); // muss in AuthContext definiert sein
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirm = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/confirm-email/${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Bestätigung fehlgeschlagen.');
                }

                setMessage(data.message || 'E-Mail erfolgreich bestätigt.');
                setStatus('success');

                // Optional: Token abrufen und einloggen
                const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: data.email ?? '', // ggf. im Backend mitsenden
                        password: ''             // evtl. aus Cookie/Speicher?
                    })
                });

                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    localStorage.setItem('token', loginData.token);
                    login(loginData.user); // z. B. user in Context speichern
                    setTimeout(() => navigate('/'), 1500); // Weiterleitung
                }
            } catch (err) {
                setMessage(err.message || 'Ein Fehler ist aufgetreten.');
                setStatus('error');
            }
        };

        confirm();
    }, [token, navigate, login]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            {status === 'loading' && (
                <>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Bestätige deine E-Mail-Adresse...</Typography>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
                    <Typography variant="h5" sx={{ mt: 2 }}>{message}</Typography>
                    <Typography sx={{ mt: 1 }}>Du wirst jetzt weitergeleitet...</Typography>
                </>
            )}

            {status === 'error' && (
                <>
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                    <Typography variant="h5" sx={{ mt: 2 }}>{message}</Typography>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/login')}>
                        Zur Anmeldung
                    </Button>
                </>
            )}
        </Container>
    );
}
