import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    FormControl,
    FormLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';

export default function EventDetails() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    const [originalEvent, setOriginalEvent] = useState(null);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [tempUploadedCover, setTempUploadedCover] = useState('');
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axiosInstance.get('/api/my-event', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });

                const { title, date, coverImage } = response.data;
                setOriginalEvent({ name: title, startDate: date, coverImage });
                setName(title);
                setStartDate(date);
                setCoverImage(coverImage || '');
                setPreviewImage(coverImage || '');
            } catch (error) {
                console.error('Fehler beim Laden des Events:', error);
                showNotification(t('eventLoadError'), 'error');
                navigate('/account');
            }
        };

        fetchEvent();
    }, [navigate, t, showNotification]);

    useEffect(() => {
        if (!originalEvent) return;
        setHasChanged(
            name !== originalEvent.name ||
            startDate !== originalEvent.startDate ||
            (tempUploadedCover && tempUploadedCover !== originalEvent.coverImage)
        );
    }, [name, startDate, tempUploadedCover, originalEvent]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const presignRes = await axiosInstance.put('/api/event/edit', {
                presignOnly: true,
                mimeType: file.type
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const { uploadUrl, url } = presignRes.data;

            await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });

            setTempUploadedCover(url);
            setPreviewImage(URL.createObjectURL(file));
            setHasChanged(true);
        } catch (error) {
            console.error('Presigned Upload fehlgeschlagen:', error);
            showNotification(t('imageUploadError'), 'error');
        }
    };

    if (!originalEvent) return null;

    return (
        <Box sx={{ p: 4, maxWidth: 500 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/account')} sx={{ color: '#5a4328' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5a4328' }}>
                    {t('editEvent')}
                </Typography>
            </Box>

            <TextField
                fullWidth
                label={t('eventName')}
                variant="outlined"
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <TextField
                fullWidth
                label={t('eventStartDate')}
                type="date"
                variant="outlined"
                margin="normal"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="normal">
                <FormLabel
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        mb: 0.5,
                        pl: 2,
                    }}
                >
                    {t('coverImage')}
                </FormLabel>

                <Box
                    sx={{
                        height: 200,
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        backgroundImage: `url(${previewImage || '/fallback-cover.jpg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mb: 1,
                        padding: '10px',
                        transition: 'border-color 0.3s',
                    }}
                />

                <Button
                    variant="outlined"
                    component="label"
                    sx={{
                        textTransform: 'none',
                    }}
                >
                    {t('chooseNewImage')}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </Button>
            </FormControl>

            <Button
                variant="contained"
                disabled={!hasChanged}
                sx={{
                    mt: 3,
                    backgroundColor: '#5a4328',
                    color: '#fff',
                    '&:disabled': { backgroundColor: '#ccc' }
                }}
                onClick={async () => {
                    try {
                        const payload = {
                            name,
                            startDate,
                            coverImage: tempUploadedCover || coverImage
                        };

                        const response = await axiosInstance.put('/api/event/edit', payload, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            }
                        });

                        setOriginalEvent({
                            name,
                            startDate,
                            coverImage: payload.coverImage
                        });

                        setCoverImage(payload.coverImage);
                        setPreviewImage(payload.coverImage); // wichtig!
                        setTempUploadedCover('');
                        setHasChanged(false);
                        showNotification(t('eventSavedSuccess'), 'success');
                    } catch (error) {
                        console.error('Fehler beim Speichern:', error.response?.data || error.message);
                        showNotification(t('eventSaveError'), 'error');
                    }
                }}
            >
                {t('save')}
            </Button>
        </Box>
    );
}
