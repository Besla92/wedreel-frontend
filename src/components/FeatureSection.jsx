import { Grid, Typography, Container, Card, CardContent } from '@mui/material';

const features = [
  { title: "Gruppen erstellen", desc: "Erstelle eine private Hochzeitsgruppe und verwalte Inhalte." },
  { title: "Videos & Bilder", desc: "Gäste können Reels, Bilder und PDFs hochladen." },
  { title: "Informationen teilen", desc: "Countdown, Einladungskarte & Zeitplan bereitstellen." }
];

export default function FeatureSection() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Funktionen
      </Typography>
      <Grid container spacing={4}>
        {features.map((f, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h6">{f.title}</Typography>
                <Typography variant="body2">{f.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
