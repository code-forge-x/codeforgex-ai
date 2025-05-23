import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ProjectSession from '../models/ProjectSession.js';

// Middleware to verify JWT token and extract user info
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and get latest role
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    req.user_id = user._id;
    req.role = user.role;
    req.email = user.email;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user has required role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.role
      });
    }

    next();
  };
};

// Middleware to check if user has access to a specific project
export const requireProjectAccess = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    if (!project_id) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const session = await ProjectSession.findOne({ project_id });
    if (!session) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = 
      session.user_id === req.user_id || 
      session.assigned_to === req.user_id || 
      req.role === 'admin';
      
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Attach session to request for use in route handlers
    req.project = session;
    next();
  } catch (err) {
    console.error('Project access check error:', err);
    res.status(500).json({ error: 'Error checking project access' });
  }
};

export default {
  authenticateToken,
  requireRole,
  requireProjectAccess
};