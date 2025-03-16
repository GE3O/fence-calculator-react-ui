import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Link 
} from '@mui/material';

const Layout = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box className="fence-app">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fence Calculator
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" className="fence-content">
        <Outlet />
      </Container>
      
      <Box component="footer" className="fence-footer" sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Two Brothers Fencing. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;