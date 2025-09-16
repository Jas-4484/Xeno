
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, List, ListItem, ListItemText, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    };
    fetchCampaigns();
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6
    }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 4, boxShadow: 6, p: 3, background: 'rgba(255,255,255,0.97)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Button variant="text" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} sx={{ textTransform: 'none', fontWeight: 600 }}>
                ← Back
              </Button>
            </Box>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom align="center">
              Campaign History
            </Typography>
            <List>
              {campaigns.map(c => (
                <ListItem
                  key={c._id}
                  divider
                  button
                  onClick={async () => {
                    setActive(c);
                    setOpen(true);
                    setLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      const r = await axios.get(`${process.env.REACT_APP_API_URL}/api/campaigns/${c._id}/stats`, { headers: { Authorization: `Bearer ${token}` } });
                      setStats(r.data);
                    } catch (e) {
                      setStats(null);
                    }
                    setLoading(false);
                  }}
                  sx={{ borderRadius: 2, mb: 1, background: '#f5f7fa' }}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600}>{c.name}</Typography>}
                    secondary={`Created: ${new Date(c.createdAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
            {campaigns.length === 0 && (
              <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 120 }}>
                <Typography color="text.secondary">No campaigns found.</Typography>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Campaign Details</DialogTitle>
          <DialogContent dividers>
            {!active ? (
              <Typography color="text.secondary">No campaign selected.</Typography>
            ) : (
              <Box>
                <Typography variant="h6" fontWeight={700}>{active.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {new Date(active.createdAt).toLocaleString()}
                </Typography>
                {active.messages && active.messages.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="subtitle2" gutterBottom>Message(s)</Typography>
                    {active.messages.map((m, i) => (
                      <Chip key={i} label={m} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Delivery Stats</Typography>
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}><CircularProgress size={16} /> <Typography variant="body2">Loading stats…</Typography></Box>
                ) : stats ? (
                  <Box>
                    <Typography variant="body2">Sent: {stats.sent}</Typography>
                    <Typography variant="body2">Failed: {stats.failed}</Typography>
                    <Typography variant="body2">Pending: {stats.pending}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No stats available.</Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default CampaignHistory;
