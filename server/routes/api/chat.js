const express = require('express');
const { authenticate } = require('../../middleware/auth');
const router = express.Router();

// POST /api/chat
router.post('/', authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Log user info for debugging
  console.log('Authenticated user:', req.user);

  // Build Claude API request body using user role and message
  const claudeBody = {
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 1024,
    stream: true,
    messages: [
      {
        role: req.user?.role || 'user',
        content: message
      }
    ]
  };

  // Log request body for debugging
  console.log('Claude API request body:', claudeBody);

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(response.status).json({ error: errorText || 'Failed to call Claude API' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            return res.end();
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    });
    response.body.on('end', () => {
      res.end();
    });
    response.body.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router; 