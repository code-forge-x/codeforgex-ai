const axios = require('axios');
// const logger = require('../utils/logger'); // To be implemented
// const config = require('../config'); // To be implemented or replaced with process.env

class AIClient {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240229';
    this.maxRetries = 3;
    this.timeout = 60000;
  }

  async generateCompletion(prompt, systemPrompt = '') {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const startTime = Date.now();
        const response = await axios.post(
          this.baseUrl,
          {
            model: this.model,
            max_tokens: 4096,
            messages: [
              { role: 'user', content: prompt }
            ],
            system: systemPrompt || undefined
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01'
            },
            timeout: this.timeout
          }
        );
        const endTime = Date.now();
        const latency = endTime - startTime;
        const result = {
          content: response.data.content[0].text,
          usage: {
            prompt_tokens: response.data.usage?.input_tokens || 0,
            completion_tokens: response.data.usage?.output_tokens || 0
          },
          latency
        };
        return result;
      } catch (error) {
        retries++;
        const status = error.response?.status;
        const errorMessage = error.response?.data?.error?.message || error.message;
        if (status === 429) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (retries >= this.maxRetries) {
          throw new Error(`Failed after ${this.maxRetries} retries: ${errorMessage}`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw new Error('Maximum retries exceeded');
  }
}

module.exports = new AIClient(); 