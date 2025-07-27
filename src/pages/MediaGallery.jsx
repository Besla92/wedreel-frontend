import {
    Box,
    Typography,
    Dialog,
    IconButton,
    Avatar,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Snackbar,
    Alert,
    Tooltip,
    LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import InviteIcon from '@mui/icons-material/PersonAddAlt';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AnimatePresence } from 'framer-motion';
import axiosInstance from "../services/axiosInstance.js";
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import LazyMediaItem from '../components/LazyMediaItem.jsx';

export default function MediaGallery({ externalUpload }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [view, setView] = useState('grid');
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [mediaItems, setMediaItems] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const location = useLocation();
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [showMyFacesOnly, setShowMyFacesOnly] = useState(false);

    const fetchMedia = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`${API_URL}/api/my-event/media`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedItems = (response.data ?? []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            setMediaItems((prev) => {
                const knownIds = new Set(fetchedItems.map((item) => item.id));
                const extras = prev.filter((item) => !knownIds.has(item.id));
                return [...extras, ...fetchedItems].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            });
        } catch (error) {
            console.error('Fehler beim Laden der Medien:', error);
        }
    }, [API_URL]);

    const fetchEvent = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`${API_URL}/api/my-event`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { title, date, inviteToken } = response.data;
            setEventTitle(title || '');
            setEventDate(date ? new Date(date).toLocaleDateString('de-DE') : '');
            setInviteLink(`${window.location.origin}/join?token=${inviteToken}`);
        } catch (err) {
            console.error('Fehler beim Laden des Events:', err);
            setError('Fehler beim Laden der Medien.');
        }
    }, [API_URL]);

    useEffect(() => {
        fetchEvent().then(r => {});
        fetchMedia().then(r => {});
        const interval = setInterval(fetchMedia, 30000);
        return () => clearInterval(interval);
    }, [fetchEvent, fetchMedia]);

    useEffect(() => {
        const uploaded = location.state?.uploaded;
        if (uploaded) {
            setMediaItems(prev => [uploaded, ...prev]);
        }
    }, [location.state]);

    useEffect(() => {
        if (externalUpload === 'refresh') {
            fetchMedia().then(r => {}); // ruft alle Medien mit korrekten Presigned GET-URLs ab
        }
    }, [externalUpload]);

    const handleOpen = (index) => {
        setOpen(true);
        setCurrentIndex(index);
    };
    const handleClose = () => setOpen(false);
    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    const handleNext = () => setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const folder = zip.folder('media');
        const batchSize = 10;
        const token = localStorage.getItem('token');
        let totalCompleted = 0;

        setDownloadProgress(0);

        for (let i = 0; i < mediaItems.length; i += batchSize) {
            const batch = mediaItems.slice(i, i + batchSize);
            const ids = batch.map(item => item.id);

            try {
                const { data: downloadLinks } = await axiosInstance.post(
                    `${API_URL}/api/my-event/media/download-links`,
                    ids,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                await Promise.all(downloadLinks.map(async (link) => {
                    try {
                        const response = await fetch(link.url);
                        if (!response.ok) throw new Error(`Fehler mit Status ${response.status}`);

                        const blob = await response.blob();
                        const ext = link.type === 'video' ? '.mp4' : '.jpg';
                        const safeName = link.filename?.replace(/[^a-zA-Z0-9_\-.]/g, '') || `media_${totalCompleted + 1}${ext}`;
                        folder.file(safeName, blob);
                    } catch (err) {
                        console.error(`Fehler beim Herunterladen von ${link.url}`, err);
                    } finally {
                        totalCompleted++;
                        setDownloadProgress(Math.round((totalCompleted / mediaItems.length) * 100));
                    }
                }));
            } catch (err) {
                console.error('Fehler beim Abrufen der Download-Links:', err);
                setError('Fehler beim Abrufen der Download-Links.');
                break;
            }
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'medien.zip');
        } catch (zipErr) {
            console.error('ZIP-Erstellung fehlgeschlagen:', zipErr);
            setError('ZIP-Archiv konnte nicht erstellt werden.');
        } finally {
            setTimeout(() => setDownloadProgress(null), 1500);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar alt="Brautpaar" src="/images/brautpaar.jpeg" sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">{eventTitle}</Typography>
                <Typography variant="body2" color="textSecondary">{eventDate}</Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<InviteIcon />}
                                onClick={() => {
                                    if (inviteLink) {
                                        navigator.clipboard.writeText(inviteLink).then(() => setCopied(true));
                                    }
                                }}
                                sx={{ backgroundColor: '#d3c1aa', color: '#5a4328' }}
                            >
                                {t('invite_guest')}
                            </Button>
                            <Tooltip title="Einstellungen">
                                <IconButton sx={{ backgroundColor: '#f3ece3' }}>
                                    <SettingsIcon sx={{ color: '#5a4328' }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Alle Medien herunterladen">
                        <IconButton onClick={handleDownloadAll} sx={{ backgroundColor: '#f3ece3' }}>
                            <CloudDownloadIcon sx={{ color: '#5a4328' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Nur Bilder mit mir anzeigen">
                        <Button
                            variant={showMyFacesOnly ? "contained" : "outlined"}
                            sx={{ backgroundColor: showMyFacesOnly ? '#d3c1aa' : '#f3ece3', color: '#5a4328' }}
                            onClick={() => setShowMyFacesOnly(!showMyFacesOnly)}
                        >
                            {showMyFacesOnly ? "Alle anzeigen" : "Nur meine Bilder"}
                        </Button>
                    </Tooltip>

                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 3 }}>
                <ToggleButtonGroup value={view} exclusive onChange={(e, val) => val && setView(val)} size="small">
                    <ToggleButton value="grid"><GridViewIcon /></ToggleButton>
                    <ToggleButton value="list"><ViewAgendaIcon /></ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {downloadProgress !== null && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: '#f3ece3', // Schriftfarbe heller gemacht
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, color: '#f3ece3' }}>
                        ZIP wird erstellt… {downloadProgress}%
                    </Typography>
                    <Box sx={{ width: '80%', maxWidth: 400 }}>
                        <LinearProgress
                            variant="determinate"
                            value={downloadProgress}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#d3c1aa',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#5a4328',
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}
            {mediaItems.length === 0 ? (
                <Typography align="center" sx={{ mt: 4, color: 'gray', fontStyle: 'italic' }}>{t('gallery_empty') || 'Die Mediathek ist noch leer…'}</Typography>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns:
                            view === 'list'
                                ? '1fr'
                                : 'repeat(3, 1fr)', // 3er-Reihen bei grid
                        gap: 1,
                        p: 2,
                    }}
                >
                <AnimatePresence>
                    {mediaItems
                        .filter(item => {
                            if (!showMyFacesOnly) return true;
                            return item.faceMatches?.includes(user.id);
                        })
                        .map((item, index) => (

                            <LazyMediaItem
                                key={item.id || index}
                                item={item}
                                index={index}
                                onClick={handleOpen}
                                view={view}
                            />
                        ))}
                    </AnimatePresence>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <Box position="relative" bgcolor="black">
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: 'white' }}><CloseIcon /></IconButton>
                    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                        {mediaItems[currentIndex] && (
                            mediaItems[currentIndex].type === 'image' ? (
                                <img src={mediaItems[currentIndex].url} alt="Zoomed" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                                <video src={mediaItems[currentIndex].url} controls autoPlay style={{ maxHeight: '100%', maxWidth: '100%' }} />
                            )
                        )}
                    </Box>
                    <Box position="absolute" top="50%" left={0} sx={{ color: 'white', fontSize: 40, cursor: 'pointer', px: 2 }} onClick={handlePrev}>‹</Box>
                    <Box position="absolute" top="50%" right={0} sx={{ color: 'white', fontSize: 40, cursor: 'pointer', px: 2 }} onClick={handleNext}>›</Box>
                </Box>
            </Dialog>

            <Snackbar open={copied} autoHideDuration={4000} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    Einladungslink kopiert
                </Alert>
            </Snackbar>

            <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
