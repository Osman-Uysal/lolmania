import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import PlayerSearch from './components/PlayerSearch';
import PlayerProfile from './components/PlayerProfile';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<PlayerSearch />} />
              <Route path="/player/:region/:summonerName" element={<PlayerProfile />} />
              <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 