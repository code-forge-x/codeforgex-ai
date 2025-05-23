import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

/**
 * @route   POST /api/ai/claude
 * @desc    Get a response from Claude AI
 * @access  Private
 */
router.post('/claude', authenticateToken, async (req, res) => {
  try {
    const { message, context, phase } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Debug: Check if API key is loaded
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build Claude API request body
    const claudeBody = {
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 18000,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    };

    // Add context if available
    if (context) {
      claudeBody.messages[0].content = `Context: ${JSON.stringify(context)}\n\nUser message: ${message}`;
    }

    // Add phase-specific system message if available
    if (phase) {
      claudeBody.system = `You are in the ${phase} phase of the project. Please provide guidance accordingly.`;
    }

    // Debug: Log the first few characters of the API key
    console.log('API Key prefix:', process.env.CLAUDE_API_KEY.substring(0, 5) + '...');

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

    res.json({ response: data.content[0].text });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: err.message || 'Failed to get response from Claude' });
  }
});

export default router; 