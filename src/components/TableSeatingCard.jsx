import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TableSeatingCard() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                backgroundColor: '#fdfbf7',
                px: 2,
                pt: 2,
                pb: 20,
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                onClick={() => navigate('/table-seating')}
                sx={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    border: '2px solid #d3c1aa',
                    borderRadius: 4,
                    padding: '24px 32px',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                    maxWidth: 500,
                    width: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    },
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        color: '#5a4328',
                        fontWeight: 'bold',
                        fontFamily: "'Playfair Display', serif",
                        mb: 1,
                    }}
                >
                    Tischverteilung
                </Typography>
                <Typography variant="body2" sx={{ color: '#7c6245' }}>
                    Finde deinen Platz für den Abend 🎉
                </Typography>
            </Box>
        </Box>
    );
}
