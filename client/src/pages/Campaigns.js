
import React, { useState } from 'react';
import { Container, Typography, Button, Box, TextField, Card, CardContent, Chip, Grid, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, List, ListItem, ListItemText, Divider } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Campaigns() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleSuggest = async () => {
    setSuggestions([]);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/suggest-messages`, { objective }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(res.data.suggestions);
      if (res.data.warning) {
        setSnackbar({ open: true, message: res.data.warning, severity: 'warning' });
      } else {
        setSnackbar({ open: true, message: 'AI suggestions loaded!', severity: 'success' });
      }
  setDialogOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'AI suggestion failed', severity: 'error' });
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/campaigns`, {
        name,
        rules: {}, // TODO: add rule builder logic
        audienceSize: 0, // TODO: preview audience size
        messages: [selectedMessage]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Campaign created!', severity: 'success' });
      setName('');
      setObjective('');
      setSuggestions([]);
      setSelectedMessage('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create campaign', severity: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6
    }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 6, p: 3, background: 'rgba(255,255,255,0.95)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Button variant="text" onClick={handleBack} sx={{ textTransform: 'none', fontWeight: 600 }}>
                ← Back
              </Button>
            </Box>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom align="center">
              Create Campaign
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Campaign Name" fullWidth value={name} onChange={e => setName(e.target.value)} variant="outlined" size="medium" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Campaign Objective" fullWidth value={objective} onChange={e => setObjective(e.target.value)} variant="outlined" size="medium" />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleSuggest}
                  disabled={loading || !objective}
                  sx={{ fontWeight: 600, py: 1.5 }}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Loading...' : 'Suggest Messages (AI)'}
                </Button>
              </Grid>
              {suggestions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Choose a message:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {suggestions.map((msg, idx) => (
                      <Chip
                        key={idx}
                        label={msg}
                        color={selectedMessage === msg ? 'primary' : 'default'}
                        onClick={() => setSelectedMessage(msg)}
                        sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2, cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCreate}
                  disabled={!name || !selectedMessage || loading}
                  sx={{ fontWeight: 700, py: 1.5, mt: 2 }}
                >
                  Create Campaign
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>

      {/* Suggestions Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Suggestions</DialogTitle>
        <DialogContent dividers>
          {suggestions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No suggestions loaded.</Typography>
          ) : (
            <List>
              {suggestions.map((msg, idx) => (
                <React.Fragment key={idx}>
                  <ListItem alignItems="flex-start" secondaryAction={
                    <Box display="flex" gap={1}>
                      <Tooltip title="Copy">
                        <IconButton edge="end" onClick={() => { navigator.clipboard.writeText(msg); setSnackbar({ open: true, message: 'Copied to clipboard', severity: 'success' }); }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button size="small" variant="contained" onClick={() => { setSelectedMessage(msg); setDialogOpen(false); setSnackbar({ open: true, message: 'Message selected', severity: 'success' }); }}>
                        Use this
                      </Button>
                    </Box>
                  }>
                    <ListItemText primaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }} primary={msg} />
                  </ListItem>
                  {idx < suggestions.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Campaigns;
