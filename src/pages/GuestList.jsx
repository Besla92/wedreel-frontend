import { useEffect, useRef, useState } from 'react';
import {
    Box, Typography, MenuItem, FormControl, Select, InputLabel, Link
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TableWithGuests from '../components/TableWithGuests';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import MediaDialog from '../components/MediaDialog';

export default function GuestList() {
    const { t } = useTranslation();
    const { event, user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [highlightInfo, setHighlightInfo] = useState(null);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableGuests, setTableGuests] = useState([]);
    const tableRefs = useRef([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchGuestsByTable = async (tableNumber) => {
        if (!event?.id || !tableNumber) return;

        try {
            const response = await axiosInstance.get('/api/guests/table', {
                params: {
                    eventId: event.id,
                    tableNumber: tableNumber
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const guests = response.data.map(g => `${g.firstName} ${g.lastName}`);
            setTableGuests([{ tableNumber, guests }]);

        } catch (err) {
            console.error('Fehler beim Laden der Gäste für Tisch:', err);
        }
    };

    useEffect(() => {
        if (!user || !event?.id) return;

        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();

        axiosInstance.get('/api/guests', {
            params: { eventId: event.id },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(res => {
            const guest = res.data.find(g =>
                `${g.firstName} ${g.lastName}`.toLowerCase() === fullName
            );

            if (guest) {
                setSelectedTable(guest.tableNumber);
                fetchGuestsByTable(guest.tableNumber).then(r => {});
                setHighlightInfo({
                    tableNumber: guest.tableNumber,
                    fullName: `${guest.firstName} ${guest.lastName}`
                });
            }
        }).catch(err => console.error('Fehler bei initialem Tisch-Scan:', err));
    }, [user, event]);

    const handleTableChange = (e) => {
        const table = e.target.value;
        setSelectedTable(table);
        fetchGuestsByTable(table).then(r => {});
        setHighlightInfo(null);
    };

    const handleSearch = () => {
        const name = searchTerm.toLowerCase();
        for (let i = 0; i < tableGuests.length; i++) {
            const found = tableGuests[i].guests.find((g) =>
                g.toLowerCase().includes(name)
            );
            if (found && tableRefs.current[i]) {
                tableRefs.current[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    };

    return (
        <Box sx={{ px: 2, py: 4, mb: 2 }}>
            <Typography
                variant="h4"
                textAlign="center"
                fontFamily="'Playfair Display', serif"
                fontWeight="bold"
                gutterBottom
                sx={{ color: '#5a4328' }}
            >
                {t('seatingplan')}
            </Typography>
            <Typography align="center" sx={{ mt: 2, mb: 5 }}>
                <Link component="button" onClick={() => setDialogOpen(true)}>
                    {t('view_seating_plan') || 'Saalplan anzeigen'}
                </Link>
            </Typography>

            <MediaDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                imageSrc="/images/saalplan.png"
                imageAlt="Einladungskarte"
            />

            {/* Tischauswahl */}
            <Box sx={{ maxWidth: 150, mx: 'auto', mt: 2 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>{t('select_table')}</InputLabel>
                    <Select
                        value={selectedTable}
                        label={t('select_table')}
                        onChange={handleTableChange}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 250,
                                }
                            }
                        }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {t('table')} {i + 1}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 3,
                    mt: 4,
                }}
            >
                {tableGuests.map((table, index) => (
                    <div ref={(el) => (tableRefs.current[index] = el)} key={index}>
                        <TableWithGuests
                            tableNumber={table.tableNumber}
                            guests={table.guests}
                            highlightGuest={
                                highlightInfo?.tableNumber === table.tableNumber
                                    ? highlightInfo.fullName
                                    : null
                            }
                        />
                    </div>
                ))}
            </Box>
        </Box>
    );
}
