import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomeNavGrid({ onInvitationClick }) {
    const navigate = useNavigate();

    const navItems = [
        {
            title: 'Einladung',
            image: '/images/card-invitation.jpg',
            path: '/roadmap',
        },
        {
            title: 'Galerie',
            image: '/images/card-gallery.jpg',
            path: '/media',
        },
        {
            title: 'Sitzordnung',
            image: '/images/card-seating.jpg',
            path: '/seating',
        },
        {
            title: 'Gäste',
            image: '/images/card-guests.jpg',
            path: '/guest-list',
        },
        {
            title: 'Quiz',
            image: '/images/card-gifts.jpg',
            path: '/quiz'
        }
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                p: 3,
            }}
        >
            {navItems.map(({ title, image, path }) => (
                <Box
                    key={title}
                    onClick={() => {navigate(path);}}
                    sx={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 3,
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.02)',
                        },
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            zIndex: 1,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.3rem',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
