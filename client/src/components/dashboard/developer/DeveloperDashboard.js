import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ChatWindow from '../user/ChatWindow';
import axios from 'axios';

const DeveloperDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/projects/current', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.session) {
          setSession(response.data.session);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const handleContextUpdate = (updatedSession) => {
    setSession(updatedSession);
  };

  const handlePhaseAction = async (action) => {
    if (!session) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `/api/projects/${session.project_id}/advance`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.session) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error('Error updating phase:', err);
      setError('Failed to update phase');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#181818' }}>
      <Box sx={{ p: 2, bgcolor: '#232323', borderBottom: '1px solid #333' }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>
          Developer Dashboard
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, p: 2 }}>
          <Paper sx={{ height: '100%', bgcolor: '#232323', color: '#fff' }}>
            <ChatWindow
              session={session}
              currentPhase={session?.current_phase || 'requirements'}
              onPhaseAction={handlePhaseAction}
              onContextUpdate={handleContextUpdate}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DeveloperDashboard;