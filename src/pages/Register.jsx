import { useState } from 'react';
import countries from '../data/countries';
import {
    Container, TextField, Button, Typography, MenuItem, Box, Select,
    InputLabel, FormControl, Snackbar, Alert
} from '@mui/material';

export default function Register() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: '',
        phoneCountry: '+49',
        phone: '',
        eventName: '',
        startDate: '',
        password: '',
        confirmPassword: '',
        salutation: '',
        firstname: '',
        lastname: '',
        street: '',
        zipcode: '',
        country: ''
    });

    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const isStrongPassword = (pw) =>
        pw.length >= 8 &&
        /[A-Z]/.test(pw) &&
        /[a-z]/.test(pw) &&
        /\d/.test(pw) &&
        /[!@#$%^&*()_\-+=<>?/{}~]/.test(pw);

    const isPasswordMatch = form.password === form.confirmPassword;
    const passwordValid = isStrongPassword(form.password);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (!isPasswordMatch) {
            setError('Passwörter stimmen nicht überein');
            setShowError(true);
            return;
        }
        setError('');
        setShowError(false);
        setStep(2);
    };

    const handleBack = () => setStep(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowError(false);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    firstname: form.firstname,
                    lastname: form.lastname,
                    phone: `${form.phoneCountry}${form.phone}`,
                    eventName: form.eventName,
                    startDate: form.startDate,
                    salutation: form.salutation,
                    street: form.street,
                    zipcode: form.zipcode,
                    country: form.country
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registrierung fehlgeschlagen');
            }

            setSuccessMsg(`Registrierung erfolgreich. Wir haben eine Bestätigungs-E-Mail an ${form.email} gesendet. 
            Bitte klicke auf den darin enthaltenen Link, um dein Konto zu aktivieren.`);
        } catch (err) {
            setError(err.message);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }} gutterBottom>
                Registrierung
            </Typography>

            {!successMsg ? (
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <>
                            <TextField fullWidth label="E-Mail" type="email" name="email" value={form.email}
                                       onChange={handleChange} margin="normal" required autoComplete="email" />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <FormControl sx={{ minWidth: 100, marginTop: 2 }}>
                                    <InputLabel>Land</InputLabel>
                                    <Select name="phoneCountry" value={form.phoneCountry}
                                            onChange={handleChange} label="Land">
                                        <MenuItem value="+49">🇩🇪 +49</MenuItem>
                                        <MenuItem value="+43">🇦🇹 +43</MenuItem>
                                        <MenuItem value="+41">🇨🇭 +41</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Telefonnummer" name="phone" value={form.phone}
                                           onChange={handleChange} margin="normal" required />
                            </Box>
                            <TextField fullWidth label="Name des Events" name="eventName" value={form.eventName}
                                       onChange={handleChange} margin="normal" required />
                            <TextField
                                fullWidth
                                label="Datum des Events"
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                margin="normal"
                                required
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField fullWidth label="Passwort" type="password" name="password" value={form.password}
                                       onChange={handleChange} margin="normal" required autoComplete="new-password"
                                       error={form.password.length > 0 && !passwordValid}
                                       helperText={
                                           form.password.length > 0 && !passwordValid
                                               ? 'Mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl & Sonderzeichen'
                                               : ''
                                       }
                            />
                            <TextField fullWidth label="Passwort bestätigen" type="password" name="confirmPassword"
                                       value={form.confirmPassword} onChange={handleChange} margin="normal" required
                                       autoComplete="new-password"
                                       error={form.confirmPassword.length > 0 && !isPasswordMatch}
                                       helperText={
                                           form.confirmPassword.length > 0 && !isPasswordMatch
                                               ? 'Passwörter stimmen nicht überein'
                                               : ''
                                       }
                            />
                            <Button
                                type="button"
                                variant="contained"
                                sx={{ mt: 2, marginBottom: 5 }}
                                onClick={handleNext}
                                disabled={!passwordValid || !isPasswordMatch}
                            >
                                Weiter
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Anrede</InputLabel>
                                <Select name="salutation" value={form.salutation} onChange={handleChange} required label="Anrede">
                                    <MenuItem value="Herr">Herr</MenuItem>
                                    <MenuItem value="Frau">Frau</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Vorname" name="firstname" value={form.firstname}
                                       onChange={handleChange} margin="normal" required />
                            <TextField fullWidth label="Nachname" name="lastname" value={form.lastname}
                                       onChange={handleChange} margin="normal" required />
                            <TextField fullWidth label="Straße & Hausnummer" name="street" value={form.street}
                                       onChange={handleChange} margin="normal" required />
                            <TextField fullWidth label="PLZ" name="zipcode" value={form.zipcode}
                                       onChange={handleChange} margin="normal" required />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Land</InputLabel>
                                <Select name="country" value={form.country} onChange={handleChange} required label="Land">
                                    {countries.map((c) => (
                                        <MenuItem key={c.code} value={c.name}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ mt: 2, display: 'flex', marginBottom: 5, justifyContent: 'space-between' }}>
                                <Button type="button" onClick={handleBack}>Zurück</Button>
                                <Button type="submit" variant="contained" disabled={loading}>Registrieren</Button>
                            </Box>
                        </>
                    )}
                </form>
            ) : (
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                        Vielen Dank für deine Registrierung!
                    </Typography>
                    <Typography>
                        Wir haben eine E-Mail an <strong>{form.email}</strong> gesendet. Bitte klicke auf den Bestätigungslink, um dein Konto zu aktivieren.
                    </Typography>
                </Box>
            )}

            {/* Snackbar für Fehler */}
            <Snackbar
                open={showError}
                autoHideDuration={5000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}
