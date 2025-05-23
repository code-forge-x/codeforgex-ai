import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Button,
  ButtonGroup
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import API_BASE_URL from '../../../api';
import aiService from '../../../services/aiService';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Error Boundary Component
class ChatWindowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ChatWindow Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="error">
            Something went wrong in the chat window. Please try refreshing the page.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

function ChatWindow({ session, currentPhase, onPhaseAction, onContextUpdate }) {
  console.log('ChatWindow render - Props:', { session, currentPhase });
  
  // Defensive: ensure session/context_data/currentPhase are always defined
  const safeSession = session || {};
  const safeContextData = safeSession.context_data && typeof safeSession.context_data === 'object' ? safeSession.context_data : {};
  const safeCurrentPhase = typeof currentPhase === 'string' && currentPhase.length > 0 ? currentPhase : 'requirements';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Defensive: ensure messages is always an array
  useEffect(() => {
    if (!Array.isArray(messages)) {
      setMessages([]);
    }
  }, [messages]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Messages state updated:', messages);
  }, [messages]);

  useEffect(() => {
    console.log('Session changed:', safeSession);
  }, [safeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // If session/context updates and has a new LLM response for the current phase, show it as a bot message
    const llmKey = `${safeCurrentPhase}_llm_response`;
    const llmResponse = safeContextData[llmKey];
    if (llmResponse) {
      // Only add if not already present in messages
      const alreadyPresent = Array.isArray(messages) && messages.some(
        m => m.sender === 'bot' && m.content === llmResponse
      );
      if (!alreadyPresent) {
        setMessages(prev => [
          ...(Array.isArray(prev) ? prev : []),
          {
            id: Date.now() + Math.random(),
            content: llmResponse,
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    }
  }, [safeContextData, safeCurrentPhase, messages]);

  useEffect(() => {
    if (!safeSession) {
      setMessages([]);
    }
  }, [safeSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !safeSession || !safeSession.project_id) return;

    const newMessage = {
      id: Date.now(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Update context with the new message
      const response = await axios.put(
        `${API_BASE_URL}/api/projects/${safeSession.project_id}/update`,
        { 
          context_data: { 
            ...safeContextData,
            last_message: message,
            conversation_history: [
              ...(safeContextData.conversation_history || []),
              { role: 'user', content: message }
            ]
          } 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.session) {
        // Update parent with new context/phase
        if (onContextUpdate) onContextUpdate(response.data.session);
      }
      
      // Get response from Claude
      const aiResponse = await aiService.getClaudeResponse(
        message, 
        response.data.session.context_data,
        safeCurrentPhase
      );
      
      // Add bot response to messages
        const botResponse = {
          id: Date.now() + 1,
        content: aiResponse,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
      
        setMessages(prev => [...prev, botResponse]);
      
      // Update context with the bot response
      await axios.put(
        `${API_BASE_URL}/api/projects/${safeSession.project_id}/update`,
        { 
          context_data: { 
            ...response.data.session.context_data,
            conversation_history: [
              ...(response.data.session.context_data.conversation_history || []),
              { role: 'assistant', content: aiResponse }
            ]
          } 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // --- Intent detection integration ---
      try {
        const intentRes = await axios.post(
          `${API_BASE_URL}/api/projects/${safeSession.project_id}/intent-detect`,
          { message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (intentRes.data && intentRes.data.intentDetected) {
          // Update session and notify user
          if (onContextUpdate) onContextUpdate(intentRes.data.session);
          // Replace with toast/notification system if available
          console.log('Intent detected: Phase advanced automatically!');
        }
      } catch (intentErr) {
        console.error('Intent detection error:', intentErr);
      }
      // --- End intent detection integration ---
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter/Shift+Enter for multiline input
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Helper: show controls only for certain phases
  const showControls = ['blueprint_generation', 'approval', 'admin_review'].includes(
    (safeCurrentPhase || '').toLowerCase().replace(/ /g, '_')
  );

  // Ensure messages is always an array and log its state
  const safeMessages = Array.isArray(messages) ? messages : [];
  if (!Array.isArray(safeMessages)) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Chat error: messages is not an array.</Typography>
      </Box>
    );
  }
  console.log('Safe messages before render:', safeMessages);

  // Early return if critical props are missing
  if (!safeSession) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading session data...</Typography>
      </Box>
    );
  }

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <ChatWindowErrorBoundary>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#181818', width: '100%' }}>
        {/* Header / Phase Banner */}
        <Box sx={{
          bgcolor: '#1976d2',
          color: 'white',
          py: 1.5,
          px: 2,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 1,
          borderBottom: '2px solid #1565c0',
          boxShadow: 1,
        }}>
          Current Phase: {(
            safeCurrentPhase || 'Loading...'
          ).charAt(0).toUpperCase() + (safeCurrentPhase || '').slice(1).replace(/_/g, ' ')}
        </Box>
        {/* Phase Action Buttons */}
        {showControls && (
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'center',
            bgcolor: '#232323',
            borderBottom: '1px solid #444'
          }}>
            <ButtonGroup variant="contained" size="small">
              <Button 
                color="primary" 
                onClick={() => onPhaseAction && onPhaseAction('advance')}
              >
                Advance
              </Button>
              <Button 
                color="success" 
                onClick={() => onPhaseAction && onPhaseAction('approve')}
              >
                Approve
              </Button>
              <Button 
                color="error" 
                onClick={() => onPhaseAction && onPhaseAction('reject')}
              >
                Reject
              </Button>
              <Button 
                color="warning" 
                onClick={() => onPhaseAction && onPhaseAction('edit')}
              >
                Edit
              </Button>
            </ButtonGroup>
          </Box>
        )}
        {/* Conversation Area */}
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          bgcolor: '#181818',
          minHeight: 0,
        }}>
          {(() => {
            try {
              return safeMessages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    mb: 2,
            }}
          >
                  <Box
              sx={{
                      maxWidth: '90%',
                      bgcolor: msg.sender === 'user' ? '#1976d2' : '#23272f',
                      color: msg.sender === 'user' ? '#fff' : '#e0e0e0',
                      borderRadius: 4,
                      p: 3,
                      boxShadow: 3,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line',
                      fontSize: 16,
                      ml: msg.sender === 'user' ? 2 : 0,
                      mr: msg.sender === 'bot' ? 2 : 0,
                      border: msg.sender === 'bot' ? '2px solid #1976d2' : 'none',
                      fontFamily: msg.sender === 'bot' ? 'Fira Mono, monospace' : 'inherit',
                      position: 'relative',
                      marginBottom: 2,
                    }}
                  >
                    <ReactMarkdown
                      children={msg.content}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          return !inline ? (
                            <Box sx={{ position: 'relative', mb: 1 }}>
                              <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: '#333', color: '#fff', '&:hover': { bgcolor: '#1976d2' } }}
                                onClick={() => copyToClipboard(codeString)}
                                title="Copy code"
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match ? match[1] : 'plaintext'}
                                PreTag="div"
                                customStyle={{ borderRadius: 10, fontSize: 15, margin: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: '1.5px solid #444', background: '#181818' }}
                                {...props}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </Box>
                          ) : (
                            <code style={{ background: '#333', color: '#fff', borderRadius: 4, padding: '2px 6px' }} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    />
                  </Box>
                </Box>
              ));
            } catch (e) {
              return (
                <Box sx={{ p: 2 }}>
                  <Typography color="error">Chat error: {String(e)}</Typography>
          </Box>
              );
            }
          })()}
        <div ref={messagesEndRef} />
      </Box>
        {/* Chat Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
            bgcolor: '#232323',
            borderTop: '1.5px solid #222',
          display: 'flex',
            gap: 1,
            mt: 1,
        }}
      >
        <TextField
          fullWidth
            multiline
            minRows={2}
            maxRows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
          disabled={loading}
            size="small"
            sx={{ bgcolor: '#181818', borderRadius: 2, color: '#fff', input: { color: '#fff' } }}
            InputProps={{
              disableUnderline: true,
              sx: { color: '#fff', fontSize: 16, px: 1 },
            }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={loading || !message.trim()}
            sx={{ bgcolor: '#1976d2', color: 'white', borderRadius: 2, '&:hover': { bgcolor: '#1565c0' } }}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
    </ChatWindowErrorBoundary>
  );
} 

export default ChatWindow; 