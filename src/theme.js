// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#fdfbf7',
    },
    primary: {
      main: '#5a4328',
    },
    secondary: {
      main: '#d3c1aa',
    },
    text: {
      primary: '#5a4328',
      secondary: '#a1886d',
    },
  },
  typography: {
    fontFamily: ['"Playfair Display"', 'serif'].join(','),
  },
});

export default theme;