// src/theme.js
import { createTheme } from '@mui/material/styles';

// Deep Forest Green / Dark Olive Green Theme
// Primary Color: A deep, professional green.
// Secondary Color: A contrasting, softer color for highlights or actions.
// Background: A very light, almost white-gray for a clean, modern feel.

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2d5a2d', // Dark Forest Green
      light: '#598759',
      dark: '#003002',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c5e1a5', // Light Green / Soft Olive
      light: '#f8ffd7',
      dark: '#94af76',
      contrastText: '#000000',
    },
    background: {
      default: '#f8f9fa', // A very light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& label.Mui-focused': {
                    color: '#2d5a2d', // main theme color
                },
                '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                        borderColor: '#2d5a2d', // main theme color
                    },
                },
            },
        },
    },
  },
});

export default theme;