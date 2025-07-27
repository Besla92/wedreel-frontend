import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Collapse
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const { t } = useTranslation();
  const [openQuiz, setOpenQuiz] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setIsReady(true);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
      <Box sx={{ p: 4 }}>
        {isReady && (
            <>
              <Typography variant="h5" gutterBottom>
                {t('hello')} {user.firstname} {user.lastname}
              </Typography>

              <Paper elevation={3} sx={{ mt: 3, borderRadius: 2 }}>
                <List disablePadding>
                  {/* Für alle sichtbar */}
                  <ListItemButton onClick={() => navigate('/profil')}>
                    <ListItemText primary={t('profile')} />
                  </ListItemButton>

                  {/* Einstellungen nur für Admin */}
                  {isAdmin && (
                      <>
                        <Divider />

                        <ListItemButton onClick={() => navigate('/admin/event/edit')}>
                          <ListItemText primary={t('event')} />
                        </ListItemButton>

                        <ListItemButton onClick={() => navigate('/admin/media/edit')}>
                          <ListItemText primary={t('media')} />
                        </ListItemButton>

                        <ListItemButton onClick={() => setOpenGuests(!openGuests)}>
                          <ListItemText primary={t('guests')} />
                        </ListItemButton>

                        <Collapse in={openGuests} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/gaeste/add')}>
                              <ListItemText primary={t('addGuest')} />
                            </ListItemButton>

                            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/gaeste/edit')}>
                              <ListItemText primary={t('editGuest')} />
                            </ListItemButton>
                          </List>
                        </Collapse>

                        <ListItemButton onClick={() => setOpenQuiz(!openQuiz)}>
                          <ListItemText primary={t('quiz')} />
                        </ListItemButton>

                        <Collapse in={openQuiz} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/quiz/add')}>
                              <ListItemText primary={t('addQuiz')} />
                            </ListItemButton>

                            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/quiz/edit')}>
                              <ListItemText primary={t('editQuiz')} />
                            </ListItemButton>
                          </List>
                        </Collapse>
                      </>
                  )}

                  {/* Abmelden */}
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary={t('logout')} />
                  </ListItemButton>
                </List>
              </Paper>
            </>
        )}
      </Box>
  );
}
