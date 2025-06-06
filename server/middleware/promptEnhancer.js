const promptManager = require('../services/promptManager');
const aiClient = require('../services/aiClient');
// const logger = require('../utils/logger'); // To be implemented

const promptEnhancer = async (req, res, next) => {
  if (!req.body.message || req.query.bypassTemplates === 'true') {
    return next();
  }
  try {
    const userMessage = req.body.message;
    const templateName = await detectTemplateType(userMessage, req.body.projectContext);
    if (templateName) {
      const parameters = {
        user_request: userMessage,
        user_id: req.user.id || 'admin',
        username: req.user.name || req.user.email,
        project_id: req.body.projectId || null,
        project_name: req.body.projectName || null,
        tech_stack: req.body.techStack || [],
        ...req.body.parameters
      };
      const enhancedPrompt = await promptManager.getPrompt(templateName, parameters);
      req.originalMessage = userMessage;
      req.body.message = enhancedPrompt.prompt;
      req.promptPerformanceId = enhancedPrompt.performanceId;
      req.templateInfo = enhancedPrompt.template;
    }
    next();
  } catch (error) {
    next();
  }
};

async function detectTemplateType(message, context = {}) {
  const messageText = message.toLowerCase();
  if ((messageText.includes('mt5') || messageText.includes('mql5') || messageText.includes('metatrader')) &&
      (messageText.includes('code') || messageText.includes('script') || messageText.includes('indicator') || 
       messageText.includes('expert advisor') || messageText.includes('strategy')))
    return 'mt5_code_generation';
  if ((messageText.includes('blueprint') || messageText.includes('architecture') || 
       messageText.includes('design') || messageText.includes('structure')) &&
      (messageText.includes('trading') || messageText.includes('financial') || 
       messageText.includes('forex') || messageText.includes('strategy')))
    return 'financial_blueprint';
  if ((messageText.includes('fix') || messageText.includes('debug') || 
       messageText.includes('error') || messageText.includes('issue')) &&
      (messageText.includes('code') || messageText.includes('script')))
    return 'quickfix_code';
  if ((messageText.includes('help') || messageText.includes('support') || 
       messageText.includes('question') || messageText.includes('how')) &&
      (messageText.includes('trading') || messageText.includes('mt5') || 
       messageText.includes('mql5') || messageText.includes('metatrader')))
    return 'technical_support';
  if (context.projectId && context.projectType) {
    return `${context.projectType}_project_chat`;
  }
  return 'general_chat';
}

const promptPerformanceTracker = async (req, res, next) => {
  const originalEnd = res.end;
  if (!req.promptPerformanceId) {
    return next();
  }

  res.end = function(chunk, encoding) {
    let responseBody;
    try {
      responseBody = chunk.toString();
      responseBody = JSON.parse(responseBody);
    } catch (e) {
      responseBody = { success: false, error: 'Non-JSON response' };
    }

    const startTime = req.startTime || Date.now();
    const aiProcessingTime = responseBody.processingTime || 0;
    const totalTime = Date.now() - startTime;
    const networkTime = totalTime - aiProcessingTime;

    const metrics = {
      success: !responseBody.error,
      tokenUsage: {
        inputTokens: responseBody.usage?.inputTokens || 0,
        outputTokens: responseBody.usage?.outputTokens || 0,
        totalTokens: (responseBody.usage?.inputTokens || 0) + (responseBody.usage?.outputTokens || 0)
      },
      latency: {
        total: totalTime,
        aiProcessing: aiProcessingTime,
        network: networkTime
      },
      error: responseBody.error ? {
        type: responseBody.error.type || 'other',
        message: responseBody.error.message || responseBody.error,
        stack: responseBody.error.stack,
        retryCount: responseBody.error.retryCount || 0
      } : null,
      requestSize: req.headers['content-length'] || 0,
      phase: req.body.phase || 'unknown',
      quality: {
        clarity: responseBody.quality?.clarity,
        accuracy: responseBody.quality?.accuracy,
        codeQuality: responseBody.quality?.codeQuality,
        testCoverage: responseBody.quality?.testCoverage
      },
      userFeedback: responseBody.userFeedback || null,
      completedAt: new Date()
    };

    promptManager.trackPerformance(req.promptPerformanceId, metrics).catch(err => {
      console.error('Failed to track performance:', err);
    });

    originalEnd.call(this, chunk, encoding);
  };

  req.startTime = Date.now();
  next();
};

module.exports = {
  promptEnhancer,
  promptPerformanceTracker
}; 