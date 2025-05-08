import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import API_URL from '../../../../api';

const ChatWindow = ({ selectedProject, chatHistory, setChatHistory }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = { ...assistantMessage };
                  return newHistory;
                });
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, bgcolor: '#232323', display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      {selectedProject && (
        <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #333', bgcolor: '#232323' }}>
          <Typography variant="h6" color="#fff" fontWeight={600}>{selectedProject.name}</Typography>
          <Typography variant="body2" color="#bbb">{selectedProject.description}</Typography>
        </Box>
      )}
      <Box ref={chatContainerRef} sx={{ flex: 1, overflowY: 'auto', px: 0, py: 3, bgcolor: '#232323', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {chatHistory.map((msg, index) => (
          <Stack key={index} direction="row" spacing={2} justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} alignItems="flex-end" sx={{ px: 4 }}>
            {msg.role === 'assistant' && <Avatar sx={{ bgcolor: '#424242', width: 32, height: 32 }}>A</Avatar>}
            <Paper elevation={0} sx={{
              p: 2,
              bgcolor: msg.role === 'user' ? '#111' : '#292929',
              color: msg.role === 'user' ? '#fff' : '#eee',
              borderRadius: 3,
              maxWidth: '60%',
              minWidth: '80px',
              wordBreak: 'break-word',
            }}>
              <Typography variant="body1">{msg.content}</Typography>
              <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
            {msg.role === 'user' && <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>U</Avatar>}
          </Stack>
        ))}
        {isLoading && (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 4 }}>
            <Avatar sx={{ bgcolor: '#424242', width: 32, height: 32 }}>A</Avatar>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#292929', color: '#eee', borderRadius: 3, maxWidth: '60%' }}>
              <CircularProgress size={20} sx={{ color: '#ff9800' }} />
            </Paper>
          </Stack>
        )}
      </Box>
      <Box sx={{ position: 'sticky', bottom: 0, left: 0, width: '100%', bgcolor: 'transparent', px: 0, py: 3, zIndex: 10 }}>
        <Box component="form" onSubmit={handleSendMessage} sx={{
          mx: 'auto',
          maxWidth: 700,
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#181818',
          borderRadius: 4,
          boxShadow: 3,
          px: 2,
          py: 1,
          gap: 1,
        }}>
          <TextField
            variant="standard"
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { color: '#fff', fontSize: 16, px: 1 },
            }}
            sx={{ bgcolor: 'transparent' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isLoading}
          />
          <IconButton type="submit" color="primary" disabled={!message.trim() || isLoading} sx={{ bgcolor: '#ff9800', color: '#fff', borderRadius: 2, ml: 1, '&:hover': { bgcolor: '#fb8c00' } }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow; 