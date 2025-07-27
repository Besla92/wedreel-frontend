import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HomeNavGrid from '../components/HomeNavGrid';
import axiosInstance from '../services/axiosInstance';

export default function Home() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [eventTitle, setEventTitle] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchAndStartCountdown = async () => {
            try {
                const response = await axiosInstance.get('/api/my-event', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const dateStr = response.data.date;
                if (!dateStr) return;

                const target = new Date(dateStr);
                const title = response.data.title || '';
                setEventTitle(title);

                const updateCountdown = () => {
                    const now = new Date();
                    const distance = target - now;

                    if (distance <= 0) {
                        clearInterval(interval);
                        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                        return;
                    }

                    setTimeLeft({
                        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((distance / 1000 / 60) % 60),
                        seconds: Math.floor((distance / 1000) % 60),
                    });
                };

                updateCountdown();
                const interval = setInterval(updateCountdown, 1000);
            } catch (err) {
                console.error('Fehler beim Laden des Events:', err);
            }
        };

        fetchAndStartCountdown();
    }, []);

    return (
        <Box sx={{ mb: 2}}>
            {/* Hero Header */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 400, md: 450 },
                    backgroundImage: 'url(/images/brautpaar.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Box
                    className="countdown-box"
                    sx={{
                        position: 'absolute',
                        bottom: 48,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        px: 4,
                        py: 3,
                        textAlign: 'center',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: 'calc(100% - 32px)', // ❗ max 100% minus Margin
                        maxWidth: 420,              // ❗ optional: damit es nicht zu groß wird
                        mx: 'auto',                 // ❗ zentrieren mit Margin
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            letterSpacing: 1,
                            color: '#5a4328',
                            mb: 1,
                            textTransform: 'uppercase',
                        }}
                    >
                        {eventTitle}
                    </Typography>

                    <motion.div
                        key={timeLeft.seconds}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 'bold',
                                fontVariantNumeric: 'tabular-nums',
                                fontSize: '1.2rem',
                                color: '#5a4328',
                            }}
                        >
                            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                        </Typography>
                    </motion.div>
                </Box>
            </Box>

            {/* Grid mit Kacheln */}
            <HomeNavGrid />
        </Box>
    );
}
