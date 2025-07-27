import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';

export default function TableWithGuests({ tableNumber, guests, highlightGuest }) {
    const radius = 80;
    const center = 100;

    const { t } = useTranslation();
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [showList, setShowList] = useState(false);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0].toUpperCase())
            .join('');
    };

    const handleGuestClick = (guest) => {
        setSelectedGuest(guest);
    };

    return (
        <Box
            sx={{
                backgroundColor: '#f9f4ee',
                borderRadius: 4,
                p: 3,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('table')} {tableNumber}
            </Typography>

            {/* Tisch-Kreis */}
            <Box
                sx={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    backgroundColor: '#f2e8dc',
                    margin: '0 auto',
                    position: 'relative',
                }}
            >
                {guests.map((guest, index) => {
                    const angle = (index / guests.length) * 2 * Math.PI;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    const isHighlight = guest.toLowerCase() === highlightGuest?.toLowerCase();
                    const isSelected = guest === selectedGuest;

                    return (
                        <Box
                            key={index}
                            onClick={() => handleGuestClick(guest)}
                            sx={{
                                position: 'absolute',
                                top: y,
                                left: x,
                                transform: 'translate(-50%, -50%)',
                                width: isHighlight || isSelected ? 48 : 36,
                                height: isHighlight || isSelected ? 48 : 36,
                                borderRadius: '50%',
                                backgroundColor: isHighlight
                                    ? '#d3c1aa'
                                    : isSelected
                                        ? '#bca88e'
                                        : '#ccb69b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: isHighlight || isSelected ? '1.1rem' : '0.9rem',
                                color: '#fff',
                                border: isHighlight
                                    ? '2px solid #5a4328'
                                    : isSelected
                                        ? '2px solid #8c7158'
                                        : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {getInitials(guest)}
                        </Box>
                    );
                })}
            </Box>

            {/* Benutzerhinweis */}
            {(highlightGuest || selectedGuest) && (
                <Typography
                    variant="body2"
                    sx={{ mt: 2, fontWeight: 'bold', color: '#5a4328' }}
                >
                    {selectedGuest && selectedGuest !== highlightGuest
                        ? selectedGuest
                        : `${t('youSitHere')}: ${highlightGuest}`}
                </Typography>
            )}
            {/* Pfeil-Button */}
            <IconButton onClick={() => setShowList(prev => !prev)} sx={{ mt: 2 }}>
                {showList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>

            {/* Ausklappbare Liste */}
            <Collapse in={showList} timeout="auto" unmountOnExit>
                <Box
                    sx={{
                        mt: 2,
                        px: 2,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                    }}
                >
                    {guests.map((guest, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: 2,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                                transition: '0.2s ease',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#ccb69b',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <PersonIcon fontSize="small" />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {guest}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Collapse>

        </Box>
    );
}
