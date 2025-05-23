import express from 'express';
import ProjectSession from '../../models/ProjectSession.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../../middleware/auth.js';
import aiClient from '../../services/aiClient.js';
import Project from '../../models/Project.js';
import Session from '../../models/Session.js';
import { distance } from 'fastest-levenshtein';
import Component from '../../models/Component.js';

const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the current user
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/projects/current
 * @desc    Get the current project session
 * @access  Private
 */
router.get('/current', authenticateToken, async (req, res) => {
  try {
    // Get user ID from either req.user.id or req.user_id
    const userId = req.user?.id || req.user_id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Try to find an existing session
    let session = await Session.findOne({ user_id: userId }).sort({ created_at: -1 });
    
    // If no session exists, create a new one
    if (!session) {
      // Create a new project first
      const project = new Project({
        user_id: userId,
        name: 'New Project',
        description: 'Created automatically'
      });
      await project.save();
      
      // Create a new session for the project
      session = new Session({
        project_id: project._id,
        user_id: userId,
        current_phase: 'requirements',
        phase_status: 'in_progress',
        context_data: {}
      });
      await session.save();
    }
    
    res.json({ session });
  } catch (err) {
    console.error('Error getting/creating current session:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create new project
    const project = new Project({
      user_id: req.user.id,
      name,
      description
    });
    
    await project.save();
    
    // Create initial session
    const session = new Session({
      project_id: project._id,
      user_id: req.user.id,
      current_phase: 'requirements',
      phase_status: 'in_progress',
      context_data: {}
    });
    
    await session.save();
    
    res.status(201).json({ project, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/projects/:id/update
 * @desc    Update project session context
 * @access  Private
 */
router.put('/:id/update', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { context_data } = req.body;
    
    const session = await Session.findOne({ project_id: id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Convert context_data object to Map
    if (context_data) {
      // If context_data is already a Map, use it directly
      if (context_data instanceof Map) {
        session.context_data = context_data;
      } else {
        // Convert object to Map
        const contextMap = new Map();
        Object.entries(context_data).forEach(([key, value]) => {
          contextMap.set(key, value);
        });
        session.context_data = contextMap;
      }
    }
    
    await session.save();
    
    // Convert Map back to object for response
    const responseSession = session.toObject();
    responseSession.context_data = Object.fromEntries(session.context_data);
    
    res.json({ session: responseSession });
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/projects/:id/advance
 * @desc    Advance the project to the next phase
 * @access  Private
 */
router.post('/:id/advance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user?.id || req.user_id;
    const userRole = req.user?.role || req.role || 'user';
    // Get the current project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Get the current session
    const session = await Session.findOne({ project_id: id }).sort({ created_at: -1 });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Ensure activity_log exists
    if (!Array.isArray(session.activity_log)) session.activity_log = [];
    let logMessage = '';
    let prevPhase = session.current_phase;
    let logAction = action;
    switch (action) {
      case 'advance': {
        // Advance to the next phase
        const nextPhase = getNextPhase(session.current_phase);
        session.current_phase = nextPhase;
        session.phase_status = 'in_progress';
        logMessage = `Advanced from ${prevPhase} to ${nextPhase}`;
        logAction = 'advanced';
        break;
      }
      case 'approve':
        session.phase_status = 'approved';
        logMessage = `Phase ${session.current_phase} approved`;
        logAction = 'approved';
        break;
      case 'reject':
        session.phase_status = 'rejected';
        logMessage = `Phase ${session.current_phase} rejected`;
        logAction = 'rejected';
        break;
      case 'edit':
        session.phase_status = 'needs_editing';
        logMessage = `Edit requested for phase ${session.current_phase}`;
        logAction = 'edited';
        break;
      case 'restart':
        session.current_phase = 'requirements';
        session.phase_status = 'in_progress';
        session.context_data = {};
        logMessage = 'Workflow restarted';
        logAction = 'restarted';
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    // Log the action
    session.activity_log.push({
      timestamp: new Date(),
      user_id: userId,
      role: userRole,
      action: logAction,
      phase: session.current_phase,
      message: logMessage
    });
    await session.save();
    res.json({ session });
  } catch (err) {
    console.error('Error advancing phase:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Helper function to get the next phase
 * @param {string} currentPhase - The current phase
 * @returns {string} - The next phase
 */
function getNextPhase(currentPhase) {
  const phases = [
    'requirements',
    'blueprint_generation',
    'approval',
    'code',
    'admin_review',
    'completed'
  ];
  
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return currentPhase;
  }
  
  return phases[currentIndex + 1];
}

// Get a project session by project_id
router.get('/:project_id', authenticateToken, async (req, res) => {
  try {
    const session = await ProjectSession.findOne({ project_id: req.params.project_id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    console.log('User ID:', req.user_id);
    console.log('Role:', req.role);
    console.log('Session User ID:', session.user_id);
    console.log('Session Assigned To:', session.assigned_to);
    
    // Check access permissions
    const hasAccess = 
      session.user_id.toString() === req.user_id || 
      session.assigned_to.toString() === req.user_id || 
      req.role === 'admin';
      
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({ success: true, session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.role === 'developer') {
      query.assigned_to = req.user_id;
    } else if (req.role !== 'admin') {
      query.user_id = req.user_id;
    }
    
    const sessions = await ProjectSession.find(query).sort({ updated_at: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download/export completed project
router.get('/:project_id/download', authenticateToken, async (req, res) => {
  try {
    const session = await ProjectSession.findOne({ project_id: req.params.project_id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'completed') return res.status(400).json({ error: 'Project not completed' });
    // Only allow owner, admin, or support to download
    if (session.user_id !== req.user_id && req.role !== 'admin' && req.role !== 'support') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // For demo: export context_data as JSON
    res.setHeader('Content-Disposition', `attachment; filename=project_${session.project_id}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(session.context_data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project session
router.put('/:project_id/update', authenticateToken, async (req, res) => {
  try {
    const session = await ProjectSession.findOne({ project_id: req.params.project_id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    console.log('User ID:', req.user_id);
    console.log('Role:', req.role);
    console.log('Session User ID:', session.user_id);
    console.log('Session Assigned To:', session.assigned_to);
    
    // Check access permissions
    const hasAccess = 
      session.user_id.toString() === req.user_id || 
      session.assigned_to.toString() === req.user_id || 
      req.role === 'admin';
      
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Update session fields (e.g., context_data, status, etc.)
    const { context_data, status, current_phase } = req.body;
    if (context_data) session.context_data = context_data;
    if (status) session.status = status;
    if (current_phase) session.current_phase = current_phase;
    
    session.activity_log.push({
      timestamp: new Date(),
      user_id: req.user_id,
      role: req.role,
      action: 'created',
      message: 'Project session updated'
    });
    
    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/projects/:id/intent-detect
 * @desc    Detect user intent to advance phase and advance if detected
 * @access  Private
 */
router.post('/:id/intent-detect', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id || req.user_id;
    const userRole = req.user?.role || req.role || 'user';
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    // List of intent keywords/phrases
    const intentKeywords = [
      'proceed', 'next', 'continue', 'go ahead', 'start', 'move on', 'advance',
      "let's do it", "let's go", 'begin', 'ready', 'ok', 'yes', 'move forward', 'let us proceed'
    ];
    const lowerMsg = message.toLowerCase();
    // Fuzzy matching: split message into words, check each word against keywords
    const words = lowerMsg.split(/\s+/);
    let detected = false;
    for (const word of words) {
      for (const kw of intentKeywords) {
        // If keyword is a phrase, check if phrase is in message (partial match)
        if (kw.includes(' ')) {
          if (lowerMsg.includes(kw)) {
            detected = true;
            break;
          }
        } else {
          // Fuzzy match for single words
          if (distance(word, kw) <= 1) {
            detected = true;
            break;
          }
        }
      }
      if (detected) break;
    }
    // Get the current project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Get the current session
    const session = await Session.findOne({ project_id: id }).sort({ created_at: -1 });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (detected) {
      // Advance to the next phase
      const prevPhase = session.current_phase;
      const nextPhase = getNextPhase(session.current_phase);
      session.current_phase = nextPhase;
      session.phase_status = 'in_progress';
      // Log the action
      if (!Array.isArray(session.activity_log)) session.activity_log = [];
      session.activity_log.push({
        timestamp: new Date(),
        user_id: userId,
        role: userRole,
        action: 'advanced',
        phase: nextPhase,
        message: `Intent detected ('${message}'). Advanced from ${prevPhase} to ${nextPhase}`
      });
      await session.save();
      return res.json({ session, intentDetected: true });
    } else {
      return res.json({ session, intentDetected: false });
    }
  } catch (err) {
    console.error('Error in intent detection:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/projects/:id/chat
 * @desc    Handle user chat message with intent detection and smart routing
 * @access  Private
 */
router.post('/:id/chat', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id || req.user_id;
    const userRole = req.user?.role || req.role || 'user';
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    // Load intent detection component
    const intentComponent = await Component.findOne({ name: 'intent_detection_system' });
    let detectedIntent = { intent: 'requirements', user_level: 'unknown', route: 'requirements' };
    if (intentComponent && intentComponent.patterns) {
      // Use patterns from component if available
      const directCodePattern = new RegExp(intentComponent.patterns.directCode, 'i');
      const expertIndicators = new RegExp(intentComponent.patterns.expertIndicators, 'gi');
      const expertMatches = message.match(expertIndicators) || [];
      if (directCodePattern.test(message) && expertMatches.length > 3) {
        detectedIntent = { intent: 'direct_code_request', user_level: 'expert', route: 'code_generation' };
      }
    } else {
      // Fallback to hardcoded patterns
      const directCodePattern = /\b(generate|create|write|code)\s+(the\s+)?(ea|expert|advisor|code)\b/i;
      const expertIndicators = /\b(mql5|ema|rsi|crossover|\d+\/\d+|pips|session)\b/gi;
      const expertMatches = message.match(expertIndicators) || [];
      if (directCodePattern.test(message) && expertMatches.length > 3) {
        detectedIntent = { intent: 'direct_code_request', user_level: 'expert', route: 'code_generation' };
      }
    }
    console.log('Detected intent:', detectedIntent);
    // Get the current project and session
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const session = await Session.findOne({ project_id: id }).sort({ created_at: -1 });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Smart routing based on intent
    if (detectedIntent.route === 'code_generation') {
      session.current_phase = 'code';
      session.phase_status = 'in_progress';
      session.activity_log.push({
        timestamp: new Date(),
        user_id: userId,
        role: userRole,
        action: 'advanced',
        phase: 'code',
        message: `Intent: direct code request. Routed directly to code generation phase.`
      });
      await session.save();
      // Call AI/codegen here
      const aiResponse = await aiClient.getResponse(message, Object.fromEntries(session.context_data), 'code');
      return res.json({ session, routed: 'code_generation', aiResponse });
    }
    // Default: requirements gathering
    session.current_phase = 'requirements';
    session.phase_status = 'in_progress';
    session.activity_log.push({
      timestamp: new Date(),
      user_id: userId,
      role: userRole,
      action: 'updated',
      phase: 'requirements',
      message: `Intent: requirements. Routed to requirements gathering phase.`
    });
    await session.save();
    // Call AI/requirements here
    const aiResponse = await aiClient.getResponse(message, Object.fromEntries(session.context_data), 'requirements');
    return res.json({ session, routed: 'requirements', aiResponse });
  } catch (err) {
    console.error('Error in chat intent routing:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 