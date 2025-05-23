import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Client for interacting with Claude AI
 */
class AIClient {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  /**
   * Get a response from Claude
   * @param {string} message - The user's message
   * @param {object} context - The current project context
   * @param {string} phase - The current project phase
   * @returns {Promise<string>} - Claude's response
   */
  async getResponse(message, context = {}, phase = 'requirements') {
    try {
      // Create a system prompt based on the current phase
      const systemPrompt = this.getSystemPrompt(phase);
      
      // Create a user message with context
      const userMessage = this.createUserMessage(message, context, phase);
      
      // Call Claude API
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 18000,
        system: systemPrompt,
            messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });
      
      return response.content[0].text;
      } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  /**
   * Get a system prompt based on the current phase
   * @param {string} phase - The current project phase
   * @returns {string} - The system prompt
   */
  getSystemPrompt(phase) {
    switch (phase) {
      case 'requirements':
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
Your current task is to gather requirements for a trading system.
Ask specific questions about:
- Trading strategy (e.g., trend following, mean reversion, breakout)
- Market (e.g., forex, stocks, crypto)
- Timeframe (e.g., intraday, swing, position)
- Risk management preferences
- Performance metrics
- Technical indicators
- Backtesting requirements

Be concise, professional, and focused on gathering all necessary information.`;
      
      case 'blueprint':
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
Your current task is to create a blueprint for a trading system based on the gathered requirements.
Focus on:
- System architecture
- Component design
- Data flow
- Trading logic
- Risk management rules
- Entry/exit conditions
- Performance monitoring

Be detailed, technical, and provide a clear structure for the trading system.`;
      
      case 'approval':
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
Your current task is to help the user review and approve the trading system blueprint.
Explain the key components and how they work together.
Address any concerns or questions the user might have.
Be prepared to make modifications if requested.`;
      
      case 'code':
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
Your current task is to help implement the approved trading system blueprint in MQL5 for MetaTrader 5.
Focus on:
- Clean, efficient code
- Proper error handling
- Trading logic implementation
- Risk management rules
- Performance optimization

Be technical, precise, and follow MQL5 best practices.`;
      
      case 'admin_review':
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
Your current task is to help with the admin review of the implemented trading system.
Focus on:
- Code quality
- Trading logic correctness
- Risk management effectiveness
- Performance optimization
- Compliance with best practices

Be thorough, critical, and suggest improvements where needed.`;
      
      default:
        return `You are CodeForegX, an AI assistant specialized in financial trading code generation.
You help users create, design, and implement trading systems for MetaTrader 5.
Be professional, knowledgeable, and focused on the user's needs.`;
    }
  }

  /**
   * Create a user message with context
   * @param {string} message - The user's message
   * @param {object} context - The current project context
   * @param {string} phase - The current project phase
   * @returns {string} - The formatted user message
   */
  createUserMessage(message, context, phase) {
    let formattedMessage = message;
    
    // Add context if available
    if (context && Object.keys(context).length > 0) {
      formattedMessage += '\n\nContext:\n';
      
      // Add last message if available
      if (context.last_message) {
        formattedMessage += `Last message: ${context.last_message}\n`;
      }
      
      // Add phase-specific context
      if (context[`${phase}_data`]) {
        formattedMessage += `${phase} data: ${JSON.stringify(context[`${phase}_data`])}\n`;
      }
    }
    
    return formattedMessage;
  }
}

export default new AIClient(); 