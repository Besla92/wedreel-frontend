import { Box, Typography, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import ChurchIcon from '@mui/icons-material/Church';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'
import { useTranslation } from "react-i18next";

const roadmapItems = [
    {
        title: 'GET TOGETHER',
        iconLabel: 'Villa Vitis',
        time: '14:00',
        location: 'Ivana Pavla II 368',
        googlemaps: 'VILLA VITIS, Ivana Pavla II 368, 21216, Kaštel Novi',
        icon: <HomeIcon fontSize="small" sx={{ color: '#fff' }} />
    },
    {
        title: 'KIRCHLICHE TRAUUNG',
        iconLabel: 'Crkva Gospa od Ružarija',
        time: '16:45',
        location: 'Ul. Ivana Danila 32',
        googlemaps: 'Church of Our Lady of the Rosary, Ul. Ivana Danila 32, 21216, Kaštel Stari',
        icon: <ChurchIcon fontSize="small" sx={{ color: '#fff' }} />
    },
    {
        title: 'RESTAURANT SPINNAKER',
        iconLabel: 'Restoran Spinnaker',
        time: '18:30',
        location: 'Obala kralja Tomislava 10a',
        googlemaps: 'Restoran Spinnaker Marina Kaštela, Obala kralja Tomislava 10a, 21213, Kaštel Gomilica',
        icon: <DinnerDiningIcon fontSize="small" sx={{ color: '#fff' }} />
    },
];

export default function WeddingRoadmap() {
    const { t } = useTranslation();

    return (
        <Box sx={{ px: 2, py: 4, backgroundColor: '#fdfbf7' }}>
            <Box
                sx={{
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '14px',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        backgroundColor: '#d3c1aa',
                    }
                }}
            >
                {roadmapItems.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'relative',
                            mb: 5,
                            pl: 5,
                        }}
                    >
                        {/* Icon Kreis */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: '-2px',
                                top: 4,
                                width: 28,
                                height: 28,
                                backgroundColor: '#a1886d',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 0 4px #fdfbf7',
                                zIndex: 1,
                            }}
                        >
                            {item.icon}
                        </Box>

                        <Box
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 2,
                                p: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                maxWidth: 600,
                            }}
                        >
                            <Typography
                                variant="p"
                                fontFamily="'Playfair Display', serif"
                                fontWeight="bold"
                                sx={{ color: '#5a4328', mb: 1 }}
                            >
                                {item.title}
                            </Typography>

                            <Typography variant="body2" sx={{ color: '#5a4328', mb: 1 }}>
                                {item.iconLabel}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccessTimeIcon fontSize="small" sx={{ color: '#a1886d' }} />
                                <Typography variant="body2" sx={{ color: '#5a4328' }}>
                                    {item.time}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon fontSize="small" sx={{ color: '#a1886d' }} />
                                <Typography
                                    variant="body2"
                                    component="a"
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.googlemaps)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        textDecoration: 'underline',
                                        color: '#5a4328',
                                        '&:hover': { color: '#7c6245' },
                                    }}
                                >
                                    {item.location}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
