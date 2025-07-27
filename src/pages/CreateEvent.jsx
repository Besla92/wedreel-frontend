import {
  Container,
  TextField,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Grid,
} from '@mui/material';
import { useState } from 'react';

export default function CreateEvent() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
    date: '',
    maxUsers: '',
    uploads: {
      images: false,
      videos: false,
      pdfs: false,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      uploads: { ...prev.uploads, [name]: checked },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formular gesendet:', form);
    // TODO: An Laravel-API senden (POST /api/register + /api/groups)
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Hochzeitsevent erstellen
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Admin-Konto erstellen
        </Typography>
        <TextField
          fullWidth
          label="E-Mail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Benutzername"
          name="username"
          value={form.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Passwort"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Event-Informationen
        </Typography>
        <TextField
          fullWidth
          label="Name des Events"
          name="name"
          value={form.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Start des Events"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          label="Maximale Nutzer"
          name="maxUsers"
          type="number"
          value={form.maxUsers}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Upload-Typen erlauben:
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="images"
                checked={form.uploads.images}
                onChange={handleCheckbox}
              />
            }
            label="Bilder"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="videos"
                checked={form.uploads.videos}
                onChange={handleCheckbox}
              />
            }
            label="Videos"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="pdfs"
                checked={form.uploads.pdfs}
                onChange={handleCheckbox}
              />
            }
            label="PDFs"
          />
        </FormGroup>

        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <Button type="submit" variant="contained">
            Event erstellen & registrieren
          </Button>
        </Grid>
      </form>
    </Container>
  );
}
