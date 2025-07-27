import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';

const sections = [
  { title: 'Veranstaltungen', image: '/images/events.jpg', link: '/events' },
  { title: 'Mediathek', image: '/images/media.jpg', link: '/media' },
  { title: 'Einstellungen', image: '/images/settings.jpg', link: '/settings' },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  return (
    <Box sx={{ p: 4 }}>
      {user && (
        <Typography variant="h5" gutterBottom>
          Hallo {user.salutation} {user.firstname} {user.lastname}
        </Typography>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} md={4} key={section.title}>
            <Card>
              <CardActionArea onClick={() => navigate(section.link)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={section.image}
                  alt={section.title}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {section.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
