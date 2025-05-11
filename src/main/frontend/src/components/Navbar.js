import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <SportsEsportsIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            LoL Analytics
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Search
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/chatbot"
          >
            Chatbot
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 