import {Box, Typography, IconButton} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import WeddingRoadmap from '../components/WeddingRoadMap';
import { useTranslation } from 'react-i18next';
import MediaDialog from "../components/MediaDialog.jsx";
import {useState} from "react";

export default function WeddingRoadMapPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <Box sx={{ p: 4, maxWidth: 900, mx: 'auto', backgroundColor: '#fdfbf7', minHeight: '100vh' }}>
            {/* Zurück-Button + Überschrift */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/')} sx={{ color: '#5a4328' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5a4328' }}>
                    {t('dailyschedule')}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                    component="button"
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        backgroundColor: '#fff',
                        color: '#5a4328',
                        border: '2px solid #d3c1aa',
                        px: 4,
                        py: 1.5,
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        fontFamily: "'Playfair Display', serif",
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                    }}
                >
                    {t('view_invitation_card') || 'Einladungskarte anzeigen'}
                </Box>
            </Box>
            <MediaDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                imageSrc="/images/einladung.jpg"
                imageAlt="Einladungskarte"
            />

            {/* Inhalt der Roadmap */}
            <WeddingRoadmap />
        </Box>
    );
}
