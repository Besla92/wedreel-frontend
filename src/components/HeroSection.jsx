import { Container, Typography, Button } from '@mui/material';

export default function HeroSection() {
  return (
    <Container sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h3" gutterBottom>
        WedReel
      </Typography>
      <Typography variant="h5" gutterBottom>
        Deine private Hochzeitsplattform für Reels & Erinnerungen.
      </Typography>
      <Button variant="contained" size="large" href="/create">
        Hochzeitsevent erstellen
      </Button>
    </Container>
  );
}
