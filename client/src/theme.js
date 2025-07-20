// client/src/theme.js
import { createTheme } from '@mui/material/styles';

// Define your monochrome color palette
const palette = {
    primary: {
        main: '#212121', // A dark grey for primary actions and headers
    },
    secondary: {
        main: '#757575', // A lighter grey for secondary elements
    },
    background: {
        default: '#f5f5f5', // A very light grey for the page background
        paper: '#ffffff',   // White for cards, tables, and other surfaces
    },
    text: {
        primary: '#212121',   // Black for primary text
        secondary: '#616161', // Dark grey for secondary text
    },
};

// Create the theme instance
const theme = createTheme({
    palette: palette,
    typography: {
        fontFamily: '"Barlow", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
    },
    components: {
        // Component overrides
        MuiCard: {
            styleOverrides: {
                root: {
                    marginBottom: '16px', // Add space between cards
                },
            },
        },
        MuiTable: {
            defaultProps: {
                size: 'small', // Makes tables more compact by default
            },
        },
        MuiTableCell: {
            styleOverrides: {
                // Reduce padding for all table cells to make rows narrower
                root: {
                    padding: '6px 10px',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                // Add a little space around buttons
                root: {
                    margin: '4px',
                },
            },
        },
    },
});

export default theme;