
import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6
    }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 6, p: 3, background: 'rgba(255,255,255,0.97)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight={700} color="primary">Mini CRM</Typography>
              <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ fontWeight: 600 }}>Logout</Button>
            </Box>
            <Typography variant="h6" color="text.secondary" mb={4} align="center">
              Welcome! What would you like to do?
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ fontWeight: 700, py: 2, fontSize: 18, borderRadius: 2 }}
                  onClick={() => navigate('/campaigns')}
                >
                  Create Campaign
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ fontWeight: 700, py: 2, fontSize: 18, borderRadius: 2 }}
                  onClick={() => navigate('/history')}
                >
                  Campaign History
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Dashboard;
