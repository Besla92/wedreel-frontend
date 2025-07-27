import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Box, Select, MenuItem } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Flag from 'react-world-flags';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import Account from './pages/Account';
import GuestList from './pages/GuestList';
import MediaGallery from './pages/MediaGallery';
import NotFound from './pages/NotFound';
import BottomNavBar from './components/BottomNavBar';
import GuestJoin from './pages/GuestJoin';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import { useAuth } from './context/AuthContext';
import ConfirmEmail from './pages/ConfirmEmail';
import ManageGuests from './pages/ManageGuests.jsx';
import EventDetails from './pages/EventDetails';
import MediaSettings from './pages/MediaSettings';
import WeddingRoadMapPage from './pages/WeddingRoadMapPage';
import Quiz from './pages/Quiz';
import AddQuiz from './pages/AddQuiz';
import EditQuiz from './pages/EditQuiz';

function App() {
    const location = useLocation();
    const { i18n } = useTranslation();
    const theme = useTheme();
    const { isAuthenticated } = useAuth();
    const [mediaItems, setMediaItems] = useState([]);

    const changeLanguage = (lang) => i18n.changeLanguage(lang);

    const handleUpload = (newItem) => {
        setMediaItems((prev) => [newItem, ...prev]);
    };

    return (
        <>
            <AppBar position="fixed" elevation={0}
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        borderBottom: `1px solid ${theme.palette.secondary.main}`,
                        color: theme.palette.text.primary,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        <img
                            src="/images/wedreel-logo.png"
                            alt="WedReel Logo"
                            style={{ height: 35 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Select
                            value={i18n.language.split('-')[0]}
                            onChange={(e) => changeLanguage(e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{
                                color: theme.palette.text.primary,
                                minWidth: 40,
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingY: 0,
                                    paddingX: 1,
                                    gap: '8px',
                                    minHeight: 0,
                                    lineHeight: 1,
                                },
                                '& .MuiSelect-icon': {
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                },
                            }}
                            renderValue={(value) => (
                                <Flag
                                    code={value.toUpperCase()}
                                    style={{ width: 24, height: 16, display: 'block', objectFit: 'cover' }}
                                />
                            )}
                        >
                            <MenuItem value="de">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Flag code="DE" style={{ width: 24, height: 16 }} />
                                    Deutsch
                                </Box>
                            </MenuItem>
                            <MenuItem value="gb">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Flag code="GB" style={{ width: 24, height: 16 }} />
                                    English
                                </Box>
                            </MenuItem>
                            <MenuItem value="hr">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Flag code="HR" style={{ width: 24, height: 16 }} />
                                    Hrvatski
                                </Box>
                            </MenuItem>
                        </Select>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    pt: '64px',
                    px: location.pathname === '/' ? 0 : 2, // ❗ Kein horizontaler Padding auf Startseite
                    pb: isAuthenticated ? '70px' : 2
                }}
            >
            <Routes>
                {/* Öffentliche Seiten */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/join" element={<GuestJoin />} />
                <Route path="/confirm-email/:token" element={<ConfirmEmail />} />

                {/* Eingeloggt, egal welche Rolle */}
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/media" element={<PrivateRoute><MediaGallery externalUpload={mediaItems[0]} /></PrivateRoute>} />
                <Route path="/guest-list" element={<PrivateRoute><GuestList /></PrivateRoute>} />
                <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
                <Route path="/roadmap" element={<PrivateRoute><WeddingRoadMapPage /></PrivateRoute>} />
                <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />

                {/* Nur für Admin */}
                <Route path="/admin" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminDashboard />
                    </RoleRoute>
                } />
                <Route path="/create" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <CreateEvent />
                    </RoleRoute>
                } />
                <Route path="/admin/gaeste/add" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <ManageGuests />
                    </RoleRoute>
                } />
                <Route path="/admin/gaeste/edit" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <ManageGuests />
                    </RoleRoute>
                } />
                <Route path="/admin/event/edit" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <EventDetails />
                    </RoleRoute>
                } />
                <Route path="/admin/media/edit" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <MediaSettings />
                    </RoleRoute>
                } />
                <Route path="/admin/quiz/add" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <AddQuiz />
                    </RoleRoute>
                } />
                <Route path="/admin/quiz/edit" element={
                    <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                        <EditQuiz />
                    </RoleRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            </Box>
            {/* Navigationsleiste nur wenn eingeloggt */}
            <AnimatePresence>
                {isAuthenticated && (
                    <motion.div
                        key="navbar"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.4 }}
                        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
                    >
                        <BottomNavBar onUpload={handleUpload} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;
