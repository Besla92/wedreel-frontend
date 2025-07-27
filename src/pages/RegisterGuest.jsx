import { useState } from 'react';
import {
    Container, TextField, Button, Typography, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RegisterGuest() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: ''
    });

    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/register-guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || 'Registrierung fehlgeschlagen.', 'error');
                return;
            }

            login(data.token, data.user);
            navigate('/'); // oder /media
        } catch (err) {
            showNotification('Netzwerkfehler oder Server nicht erreichbar.', 'error');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>Als Gast registrieren</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Bitte gib deinen Namen und deine E-Mail-Adresse ein, um Zugang zur Hochzeit zu erhalten.
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="firstname"
                            label="Vorname"
                            fullWidth
                            required
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="lastname"
                            label="Nachname"
                            fullWidth
                            required
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="email"
                            label="E-Mail"
                            type="email"
                            fullWidth
                            required
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                    Registrieren
                </Button>
            </form>
        </Container>
    );
}
