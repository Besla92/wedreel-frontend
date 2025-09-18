import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Paper,
    LinearProgress,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import { uploadToS3 } from './MediaUpload.jsx';

export default function BottomNavBar({ onUpload }) {
    const navigate = useNavigate();
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);
    const location = useLocation();

    const routeToIndex = {
        '/': 0,
        '/guest-list': 1,
        '/account': 2,
        '/media': 3,
    };

    const currentPath = location.pathname;

    let currentValue = 0;
    if (currentPath.startsWith('/guest-list')) {
        currentValue = 1;
    } else if (currentPath.startsWith('/account') || currentPath.startsWith('/admin')) {
        currentValue = 2;
    } else if (currentPath.startsWith('/media')) {
        currentValue = 3;
    }

    function waitForImage(url, maxTries = 5) {
        return new Promise((resolve) => {
            let tries = 0;
            const tryLoad = () => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => {
                    if (++tries < maxTries) {
                        setTimeout(tryLoad, 1000);
                    } else {
                        resolve(); // Weiter, auch wenn S3 zu lange braucht
                    }
                };
                img.src = `${url}?cacheBuster=${Date.now()}`;
            };
            tryLoad();
        });
    }

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploading(true);
            
            // Upload files sequentially to avoid overwhelming the server
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Skip rate limit for multiple uploads (except for the first one)
                const uploaded = await uploadToS3(file, undefined, i > 0);
                await waitForImage(uploaded.url);
            }
            
            onUpload?.('refresh');
            if (location.pathname !== '/media') navigate('/media');
        } catch (err) {
            console.error('Upload fehlgeschlagen:', err.message || err);
        } finally {
            setUploading(false);
        }
    };

    const token = localStorage.getItem('token');
    if (!token) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderTop: '1px solid #e0d6c5',
            }}
            elevation={3}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                onChange={handleUpload}
                style={{ display: 'none' }}
            />
            {uploading && (
                <LinearProgress
                    variant="indeterminate"
                    sx={{
                        position: 'absolute',
                        top: -4,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: '#d3c1aa',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: '#5a4328',
                        },
                    }}
                />
            )}
            <BottomNavigation
                value={currentValue}
                onChange={(_, newValue) => {
                    const path = Object.entries(routeToIndex).find(([_, idx]) => idx === newValue)?.[0];
                    if (path) navigate(path);
                }}
                sx={{
                    backgroundColor: '#fdfbf7',
                    color: '#5a4328',
                    position: 'relative',
                }}
            >
                <BottomNavigationAction value={0} icon={<HomeIcon />} onClick={() => navigate('/')} />
                <BottomNavigationAction
                    value={1}
                    icon={<GroupIcon />}
                    onClick={() => navigate('/guest-list')}
                    sx={{ marginRight: 4 }}
                />
                <Box
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                        position: 'absolute',
                        top: -28,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 56,
                        height: 56,
                        backgroundColor: '#d3c1aa',
                        color: '#5a4328',
                        borderRadius: '50%',
                        border: '4px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                    }}
                >
                    <PhotoCameraIcon />
                </Box>
                <BottomNavigationAction
                    value={3}
                    icon={<MenuBookIcon />}
                    onClick={() => navigate('/media')}
                    sx={{ marginLeft: 4 }}
                />
                <BottomNavigationAction value={2} icon={<AccountCircleIcon />} onClick={() => navigate('/account')} />
            </BottomNavigation>
        </Paper>
    );
}
