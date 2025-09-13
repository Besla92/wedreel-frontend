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
import { useRef } from 'react';
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
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const location = useLocation();
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [showMyFacesOnly, setShowMyFacesOnly] = useState(false);
    const [eventId, setEventId] = useState(null);

    const fetchMedia = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`/api/my-event/media`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const fetchedItems = (response.data ?? []).sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
            setMediaItems((prev) => {
               const prevById = new Map(prev.map(i => [i.id, i]));
               const merged = fetchedItems.map(it => {
                    const old = prevById.get(it.id);
                    if (!old) return it;

                    return {
                        ...it,
                        url: old.url ?? it.url,
                        thumbUrl: old.thumbUrl ?? it.thumbUrl,
                    };
               });

               const fetchedIds = new Set(fetchedItems.map(i => i.id));
               const extras = prev.filter(p => !fetchedIds.has(p.id));
               const all = [...extras, ...merged];
               all.sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
                    return all;
               });
            } catch (error) {
                console.error('Fehler beim Laden der Medien:', error);
            }
        }, []);


    const fetchEvent = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`/api/my-event`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { id, title, date, inviteToken } = response.data || {};
            if (id) setEventId(id);

            setEventTitle(title || '');
            setEventDate(date ? new Date(date).toLocaleDateString('de-DE') : '');
            setInviteLink(`${window.location.origin}/join?token=${inviteToken}`);
        } catch (err) {
            console.error('Fehler beim Laden des Events:', err);
            setError('Fehler beim Laden der Medien.');
        }
    }, []);

    const refreshUrlFor = useCallback(async (id) => {
        const token = localStorage.getItem('token');
        const { data } = await axiosInstance.get(`/api/my-event/media/by-ids?ids=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        const fresh = Array.isArray(data) ? data[0] : null;
        if (!fresh) return;
        setMediaItems(prev => prev.map(it => it.id === id ? { ...it, url: fresh.url, thumbUrl: fresh.thumbUrl ?? it.thumbUrl } : it));
    }, []);

    const etagRef = useRef(null);
    const pollStopRef = useRef(null);
    const esRef = useRef(null);
    const visibleRef = useRef(document.visibilityState === 'visible');

    useEffect(() => {
        const onVis = () => { visibleRef.current = document.visibilityState === 'visible'; };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const mergePreservingUrls = (incoming, prev) => {
        const prevById = new Map(prev.map(i => [i.id, i]));
        const merged = incoming.map(it => {
            const old = prevById.get(it.id);
            if (!old) return it;
            return { ...it, url: old.url ?? it.url, thumbUrl: old.thumbUrl ?? it.thumbUrl };
        });
        const incomingIds = new Set(incoming.map(i => i.id));
        const extras = prev.filter(p => !incomingIds.has(p.id));
        const all = [...extras, ...merged].sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
        return all;
    };

    const isPollingRef = useRef(false);

    const startSmartPolling = useCallback(() => {
        if (isPollingRef.current) return () => {}; // уже идёт
        isPollingRef.current = true;

        let stopped = false;
        let delay = 5000;

        (async () => {
            while (!stopped) {
                if (!visibleRef.current) { await sleep(10000); continue; }
                try {
                    const token = localStorage.getItem('token');
                    const hdrs = { Authorization: `Bearer ${token}` };
                    if (etagRef.current) hdrs['If-None-Match'] = etagRef.current;

                    const res = await axiosInstance.get('/api/my-event/media', {
                        headers: hdrs,
                        validateStatus: () => true,
                        withCredentials: true,
                    });

                    if (res.status === 200) {
                        etagRef.current = res.headers?.etag || res.headers?.ETag || etagRef.current;
                        const fetched = (res.data ?? []).sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
                        setMediaItems(prev => mergePreservingUrls(fetched, prev));
                        delay = 5000;
                    } else if (res.status === 304) {
                        delay = Math.min(delay * 2, 60000);
                    } else {
                        delay = Math.min(delay * 2, 60000);
                    }
                } catch {
                    delay = Math.min(delay * 2, 60000);
                }
                await sleep(delay);
            }
        })();

        return () => { stopped = true; isPollingRef.current = false; };
    }, [axiosInstance, setMediaItems]);

    const stopSmartPolling = () => {
        if (pollStopRef.current) { pollStopRef.current(); pollStopRef.current = null; }
    };

    // Init loading
    useEffect(() => {
        fetchEvent().then(() => {});
        fetchMedia().then(() => {});
    }, [fetchEvent, fetchMedia]);

    useEffect(() => {
        if (!eventId) return;

        let cancelled = false;

        const connectSSE = async () => {
            try {
                await axiosInstance.get('/api/mercure/authorize', {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (cancelled) return;

                const hub = new URL('/.well-known/mercure', window.location.origin);
                hub.searchParams.append('topic', `event/${eventId}`);

                esRef.current?.close();

                const es = new EventSource(hub.toString(), { withCredentials: true });
                esRef.current = es;

                es.onopen = () => {
                    console.debug('[SSE] onopen');
                    stopSmartPolling();
                };

                es.onmessage = (e) => {
                    console.debug('[SSE] onmessage');
                    try {
                        const msg = JSON.parse(e.data);
                        if (msg?.type === 'media_added' && Array.isArray(msg.ids) && msg.ids.length) {
                            const token = localStorage.getItem('token');
                            const idsParam = msg.ids.join(',');
                            axiosInstance.get(`/api/my-event/media/by-ids?ids=${idsParam}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                withCredentials: true,
                            }).then(({ data }) => {
                                setMediaItems(prev => {
                                    const known = new Set(prev.map(i => i.id));
                                    const fresh = (data || []).filter(i => !known.has(i.id));
                                    if (!fresh.length) return prev;
                                    const merged = [...fresh, ...prev].sort((a,b)=> new Date(b.uploadedAt) - new Date(a.uploadedAt));
                                    return merged;
                                });
                            }).catch(() => {
                                console.warn('by-ids failed');
                            });
                        }
                    } catch {

                    }
                };

                es.onerror = () => {
                    console.debug('[SSE] onerror');
                    console.warn('Mercure/SSE error — switching to smart polling');

                    if (!pollStopRef.current) {
                        pollStopRef.current = startSmartPolling();
                    }
                };
            } catch (err) {
                console.warn('Mercure authorize failed:', err);
            }
        };

        console.debug('[SSE] connect');
        connectSSE();

        return () => {
            cancelled = true;
            esRef.current?.close();
            esRef.current = null;
            // при уходе со страницы тоже остановим поллинг
            stopSmartPolling();
        };
    }, [eventId, startSmartPolling]);


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
                    `/api/my-event/media/download-links`,
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
                                onUrlExpired={() => refreshUrlFor(item.id)}
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
