import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNotification } from '../context/NotificationContext';
import axiosInstance from '../services/axiosInstance';

export default function ManageGuests() {
    const { event } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { t } = useTranslation();

    const handleAddGuest = async () => {
        const token = localStorage.getItem('token');
        const fullFirst = firstname.trim();
        const fullLast = lastname.trim();

        if (fullFirst && fullLast) {
            try {
                await axiosInstance.post(
                    '/api/guests',
                    {
                        firstName: fullFirst,
                        lastName: fullLast,
                        tableNumber: selectedTable,
                        eventId: event.id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFirstname('');
                setLastname('');
                setSelectedTable('');
                showNotification(t('guestAddedSuccessfully'), 'success');
            } catch (error) {
                const backendError = error.response?.data?.error;
                const translations = {
                    'Unbekannter Fehler beim Hinzuf\u00fcgen.': t('guestAddUnknownError'),
                    'Gast bereits vorhanden.': t('guestAlreadyExists'),
                };

                const msg = translations[backendError] || backendError || t('guestAddUnknownError');
                showNotification(msg, 'error');
            }
        }
    };

    const commonInputStyles = {
        '& .MuiInputBase-input': {
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.1rem',
            color: '#5a4328',
        },
        '& .MuiInputLabel-root': {
            fontFamily: "'Playfair Display', serif",
            color: '#5a4328',
        },
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fdfaf4',
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/account')} sx={{ color: '#5a4328' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5a4328', fontFamily: "'Playfair Display', serif" }}>
                    {t('addGuests')}
                </Typography>
            </Box>

            {/* Vorname */}
            <TextField
                fullWidth
                label={t('firstName')}
                variant="outlined"
                margin="normal"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                sx={commonInputStyles}
            />

            {/* Nachname */}
            <TextField
                fullWidth
                label={t('lastName')}
                variant="outlined"
                margin="normal"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                sx={commonInputStyles}
            />

            {/* Tischnummer */}
            <FormControl fullWidth margin="normal">
                <InputLabel
                    sx={{
                        fontFamily: "'Playfair Display', serif",
                        color: '#5a4328',
                    }}
                >
                    {t('tableNumber')}
                </InputLabel>
                <Select
                    value={selectedTable}
                    label={t('tableNumber')}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    sx={{
                        ...commonInputStyles,
                        fontFamily: "'Playfair Display', serif",
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: { maxHeight: 200 },
                        },
                    }}
                >
                    {[...Array(20)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Button */}
            <Button
                variant="contained"
                onClick={handleAddGuest}
                disabled={!firstname.trim() || !lastname.trim() || !selectedTable}
                sx={{
                    mt: 3,
                    backgroundColor: '#5a4328',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontFamily: "'Playfair Display', serif",
                    '&:disabled': { backgroundColor: '#ccc' }
                }}
            >
                {t('add')}
            </Button>

            {errorMessage && (
                <Typography
                    variant="body2"
                    sx={{
                        color: 'red',
                        textAlign: 'center',
                        mt: 2,
                        fontWeight: 'bold',
                        fontFamily: "'Playfair Display', serif",
                    }}
                >
                    {errorMessage}
                </Typography>
            )}
        </Box>
    );
}
