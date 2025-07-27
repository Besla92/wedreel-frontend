// components/MediaDialog.jsx (neuer, allgemeiner Name)

import { Dialog, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function MediaDialog({ open, onClose, imageSrc, imageAlt }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <Box position="relative" bgcolor="black">
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: 'white' }}>
                    <CloseIcon />
                </IconButton>
                <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                </Box>
            </Box>
        </Dialog>
    );
}