import { Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container sx={{
            textAlign: 'center',
            paddingTop: '10vh',
            color: '#5a4328'
        }}>
            <Typography variant="h3" gutterBottom>
                404 – Seite nicht gefunden
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Die von dir angeforderte Seite existiert nicht. Vielleicht war's ein Tippfehler?
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Zur Startseite
            </Button>
        </Container>
    );
}
