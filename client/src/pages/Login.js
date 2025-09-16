import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const handleGoogleLogin = () => {
  window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
};

function Login() {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #6a11cb 0%, #2575fc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6
    }}>
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 6, boxShadow: 10, p: 4, background: 'rgba(255,255,255,0.98)' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
              Welcome to Mini CRM
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Manage your customers efficiently.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                mt: 2,
                fontWeight: 700,
                fontSize: 17,
                px: 5,
                py: 2,
                borderRadius: 3,
                boxShadow: 2,
                background: 'linear-gradient(90deg, #4285F4 0%, #34A853 100%)'
              }}
              size="large"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
