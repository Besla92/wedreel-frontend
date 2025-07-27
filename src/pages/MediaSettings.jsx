import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import axiosInstance from '../services/axiosInstance';

export default function MediaSettings() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    const [mediaTitle, setMediaTitle] = useState('');
    const [mediaDescription, setMediaDescription] = useState('');
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        // Initiale Mediadaten laden, optional
        // Beispiel: setMediaTitle('Hochzeitsfotos'), setMediaDescription('Hier erscheinen eure Erinnerungen')
    }, []);

    useEffect(() => {
        // Beispielhafte Change-Erkennung – anpassen je nach realer Logik
        setHasChanged(mediaTitle !== '' || mediaDescription !== '');
    }, [mediaTitle, mediaDescription]);

    const handleSave = async () => {
        try {
            // Beispielhafte API
            await axiosInstance.post('/api/media/settings', {
                title: mediaTitle,
                description: mediaDescription
            });

            showNotification(t('mediaSaved'), 'success');
            setHasChanged(false);
        } catch (err) {
            console.error(err);
            showNotification(t('mediaSaveError'), 'error');
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 600 }}>
            {/* Zurück + Überschrift */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/account')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5a4328' }}>
                    {t('manageMedia')}
                </Typography>
            </Box>

            <TextField
                fullWidth
                label={t('mediaTitle')}
                variant="outlined"
                margin="normal"
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
            />

            <TextField
                fullWidth
                label={t('mediaDescription')}
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                value={mediaDescription}
                onChange={(e) => setMediaDescription(e.target.value)}
            />

            <Button
                variant="contained"
                disabled={!hasChanged}
                onClick={handleSave}
                sx={{
                    mt: 3,
                    backgroundColor: '#5a4328',
                    color: '#fff',
                    '&:disabled': { backgroundColor: '#ccc' }
                }}
            >
                {t('save')}
            </Button>
        </Box>
    );
}
