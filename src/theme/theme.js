import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a brand-themed dark mode theme
export const createAppTheme = () => {
  // Brand colors for Two Brothers Fencing
  const primaryColor = '#3a5161'; // Dark blue-gray
  const secondaryColor = '#518651'; // Forest green
  const accentColor = '#d9a566'; // Warm wood-like tan/gold

  let theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primaryColor,
        light: '#536b7b',
        dark: '#293a47',
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryColor,
        light: '#6fa36f',
        dark: '#385938',
        contrastText: '#ffffff',
      },
      error: {
        main: '#d32f2f',
      },
      warning: {
        main: '#ffa726',
      },
      info: {
        main: '#29b6f6',
      },
      success: {
        main: '#66bb6a',
      },
      background: {
        default: '#1c2a34', // Dark blue-gray background
        paper: '#263742', // Slightly lighter than the default background
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0bec5',
      },
      accent: {
        main: accentColor,
        light: '#e4bc85',
        dark: '#ab7e42',
        contrastText: '#000000',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: primaryColor,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              caretColor: '#66bb6a',
            },
          },
        },
      },
    },
  });

  // Make the typography responsive
  theme = responsiveFontSizes(theme);

  return theme;
};