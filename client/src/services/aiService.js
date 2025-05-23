import axios from 'axios';
import API_BASE_URL from '../api';

/**
 * Service for interacting with the AI API
 */
class AIService {
  /**
   * Get a response from Claude
   * @param {string} message - The user's message
   * @param {object} context - The current project context
   * @param {string} phase - The current project phase
   * @returns {Promise<string>} - Claude's response
   */
  async getClaudeResponse(message, context, phase) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/claude`,
        { message, context, phase },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data.response;
    } catch (error) {
      console.error('Error getting Claude response:', error);
      throw new Error('Failed to get response from Claude');
    }
  }

  /**
   * Get a fallback response if Claude API fails
   * @param {string} phase - The current project phase
   * @returns {string} - A fallback response
   */
  getFallbackResponse(phase) {
    switch (phase) {
      case 'requirements':
        return 'I understand you want to gather requirements. Please provide more details about your project needs, constraints, and goals.';
      case 'blueprint':
        return 'Based on your requirements, I\'ll help create a detailed blueprint. Let me know if you want to focus on any specific aspects.';
      case 'approval':
        return 'I\'ve prepared the blueprint for your review. Please let me know if you want to approve, request changes, or need clarification.';
      case 'code':
        return 'I\'ll help you implement the approved blueprint. Let me know which part you\'d like to start with.';
      case 'admin_review':
        return 'The implementation is ready for admin review. Please provide any feedback or specific areas to focus on.';
      default:
        return 'I\'m here to help. What would you like to discuss?';
    }
  }
}

export default new AIService(); 