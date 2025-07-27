import { Container, Typography, Box } from '@mui/material';
import preview from '../assets/preview1.jpg'; // Dummy-Bild

export default function PreviewSection() {
  return (
    <Container sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        So sieht’s aus
      </Typography>
      <Box
        component="img"
        src={preview}
        alt="App Vorschau"
        sx={{ maxWidth: '100%', borderRadius: 2, boxShadow: 3 }}
      />
    </Container>
  );
}
