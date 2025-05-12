import express from 'express';
import promptComponentController from '../../controllers/promptComponentController.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Get all components
router.get('/', authenticateToken, promptComponentController.getAllComponents);

// Get component by ID
router.get('/:id', authenticateToken, promptComponentController.getComponentById);

// Get component by name
router.get('/name/:name', authenticateToken, promptComponentController.getComponentByName);

// Get active component by name
router.get('/active/:name', authenticateToken, promptComponentController.getActiveComponentByName);

// Create new component
router.post('/', authenticateToken, promptComponentController.createComponent);

// Update component
router.put('/:id', authenticateToken, promptComponentController.updateComponent);

// Activate component version
router.put('/:id/activate', authenticateToken, promptComponentController.activateComponent);

// Get component usage statistics
router.get('/:id/usage', authenticateToken, promptComponentController.getComponentUsage);

export default router; 