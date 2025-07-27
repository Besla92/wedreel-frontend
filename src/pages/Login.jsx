import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ AuthContext einbinden
import {
  Container,
  TextField,
  Button,
  Typography
} from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ login() aus dem Context holen

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!API_URL) {
      setError('API-URL ist nicht gesetzt. Bitte .env Datei prüfen.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message?.toLowerCase().includes('invalid')
            ? 'Zugangsdaten stimmen nicht überein.'
            : data.message || 'Login fehlgeschlagen';
        setError(msg);
        return;
      }

      login(data.token, data.user); // ✅ AuthContext aktualisieren
      localStorage.setItem('user', JSON.stringify(data.user)); // optional

      navigate('/'); // ✅ Weiterleitung nach Login
    } catch (err) {
      setError('Netzwerkfehler oder Backend nicht erreichbar.');
    }
  };

  return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
          />
          <TextField
              fullWidth
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
          />
          {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 3, }}>
            Noch kein Konto?{' '}
            <span
                onClick={() => navigate('/register')}
                style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Jetzt registrieren
            </span>
          </Typography>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Einloggen
          </Button>
        </form>
      </Container>
  );
}