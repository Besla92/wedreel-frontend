import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Typography, TextField, Button, Alert, Paper
} from '@mui/material';
import axios from 'axios';

export default function JoinGuestPage() {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);

    const token = searchParams.get('token');

    const isStrongPassword = (pw) =>
        pw.length >= 8 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /\d/.test(pw) &&
        /[!@#$%^&*()_\-+=<>?/{}~]/.test(pw);

    const isPasswordMatch = form.password === form.confirmPassword;
    const passwordValid = isStrongPassword(form.password);

    useEffect(() => {
        if (!token) {
            setError('Einladungslink ist ungültig.');
            return;
        }

        const fetchEventByToken = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/event/by-token/${token}`);
                setEventTitle(response.data.name);
            } catch (err) {
                setError('Event nicht gefunden oder ungültiger Link.');
            }
        };

        fetchEventByToken();
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordValid) {
            setError('Passwort ist nicht sicher genug.');
            return;
        }

        if (!isPasswordMatch) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }

        //if (!profilePicture) {
        //    setError('Bitte lade ein Profilbild hoch.');
        //    return;
        //}

        const formData = new FormData();
        formData.append('firstName', form.firstName);
        formData.append('lastName', form.lastName);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('inviteToken', token);
        formData.append('profilePicture', profilePicture);

        console.log(formData);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/join`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                setError(data.error || 'Registrierung fehlgeschlagen.');
                return;
            }

            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError('Netzwerkfehler oder Server nicht erreichbar.');
        }
    };

    return (
        <Box sx={{ px: 2, py: 6, maxWidth: 500, mx: 'auto' }}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, backgroundColor: '#fdfbf7' }}>
                <Typography variant="h5" align="center" sx={{ mb: 2, color: '#5a4328', fontWeight: 'bold' }}>
                    Willkommen zur Hochzeit von {eventTitle || '...'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField fullWidth label="Vorname" name="firstName" value={form.firstName} onChange={handleChange} sx={{ mb: 2 }} required />
                    <TextField fullWidth label="Nachname" name="lastName" value={form.lastName} onChange={handleChange} sx={{ mb: 2 }} required />
                    <TextField fullWidth label="E-Mail" name="email" value={form.email} onChange={handleChange} sx={{ mb: 2 }} type="email" required />
                    <TextField
                        fullWidth
                        label="Passwort"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        required
                        error={form.password.length > 0 && !passwordValid}
                        helperText={
                            form.password.length > 0 && !passwordValid
                                ? 'Mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl & Sonderzeichen'
                                : ''
                        }
                    />
                    <TextField
                        fullWidth
                        label="Passwort wiederholen"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                        required
                        error={form.confirmPassword.length > 0 && !isPasswordMatch}
                        helperText={
                            form.confirmPassword.length > 0 && !isPasswordMatch
                                ? 'Passwörter stimmen nicht überein'
                                : ''
                        }
                    />

                    <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                        Profilbild auswählen
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                    </Button>

                    {profilePicture && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Ausgewählt: {profilePicture.name}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ backgroundColor: '#d3c1aa', color: '#5a4328' }}
                        disabled={!passwordValid || !isPasswordMatch}
                    >
                        Beitreten
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
