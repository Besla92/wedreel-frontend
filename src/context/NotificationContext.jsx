// src/context/NotificationContext.jsx
import { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success'); // "success" | "error" | "info" | "warning"
    const [open, setOpen] = useState(false);

    const showNotification = (msg, level = 'success') => {
        setMessage(msg);
        setSeverity(level);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
