import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// POST /api/chat
router.post('/', authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Log user info for debugging
  console.log('Authenticated user:', req.user);

  // Determine Claude role: only 'user' or 'assistant' allowed
  let claudeRole = 'user';
  // If you want to allow sending as 'assistant' (for future), you can add logic here
  // For now, always use 'user' for both user and admin

  // Build Claude API request body
  const claudeBody = {
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 4000,
    stream: true,
    messages: [
      {
        role: claudeRole,
        content: message
      }
    ]
  };

  // Log request body for debugging
  console.log('Claude API request body:', claudeBody);

  try {
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

    // Collect the full response instead of streaming
    let fullResponse = '';
    response.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullResponse += parsed.delta.text;
            }
          } catch (e) {}
        }
      }
    });
    response.body.on('end', () => {
      // Send a single JSON response
      res.json({ content: fullResponse });
    });
    response.body.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Stream error' });
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;