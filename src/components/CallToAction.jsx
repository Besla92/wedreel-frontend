import { Container, Typography, Button } from '@mui/material';

export default function CallToAction() {
  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Starte deine Hochzeitserinnerung mit WedReel
      </Typography>
      <Button variant="contained" size="large" href="/create">
        Jetzt loslegen
      </Button>
    </Container>
  );
}
