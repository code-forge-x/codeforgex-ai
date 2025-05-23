import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import fetch from 'node-fetch';

const router = express.Router();

// POST /api/chat
router.post('/', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Log user info for debugging
  console.log('Authenticated user:', req.user);

  // Build Claude API request body
  const claudeBody = {
    model: 'claude-3-sonnet-20240229',
    max_tokens: 18000,
    messages: [
      {
        role: 'user',
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

    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    res.json({ content: data.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;