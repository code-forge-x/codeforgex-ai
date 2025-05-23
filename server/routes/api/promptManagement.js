import express from 'express';
import promptTemplateController from '../../controllers/promptTemplateController.js';
import promptComponentController from '../../controllers/promptComponentController.js';
import promptPerformanceController from '../../controllers/promptPerformanceController.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Placeholder middleware for auth and admin
const auth = (req, res, next) => { req.user = { email: 'admin@codeforgex.com' }; next(); };
const admin = (req, res, next) => { next(); };

// Require admin role for all routes in this router
router.use(auth, admin);

// Template routes
router.get('/templates', authenticateToken, promptTemplateController.getAllTemplates);
router.get('/templates/:id', authenticateToken, promptTemplateController.getTemplateById);
router.get('/templates/name/:name', authenticateToken, promptTemplateController.getTemplateByName);
router.get('/templates/:id/active', authenticateToken, promptTemplateController.getActiveTemplateById);
router.post('/templates', authenticateToken, promptTemplateController.createTemplate);
router.put('/templates/:id', authenticateToken, promptTemplateController.updateTemplate);
router.post('/templates/:id/activate', authenticateToken, promptTemplateController.activateTemplate);
router.delete('/templates/:id', authenticateToken, promptTemplateController.deleteTemplate);
router.get('/templates/:id/versions', authenticateToken, promptTemplateController.getTemplateVersions);
router.get('/templates/name/:name/versions', authenticateToken, promptTemplateController.getTemplateVersionsByName);
router.post('/templates/:id/rollback', authenticateToken, promptTemplateController.rollbackTemplate);
router.get('/templates/:id/compare/:version1/:version2', authenticateToken, promptTemplateController.compareVersions);
router.get('/templates/:id/diff/:version1/:version2', authenticateToken, promptTemplateController.getVersionDiff);
router.get('/templates/:id/diff/:version1/:version2/:format', authenticateToken, promptTemplateController.getVersionDiff);
router.post('/templates/preview', authenticateToken, promptTemplateController.generatePreview);
// router.post('/templates/:id/test', promptTemplateController.testTemplate); // To be implemented
// router.get('/templates/:id/compare/:versionId', promptTemplateController.compareTemplateVersions); // To be implemented
// router.get('/templates/:id/performance', promptTemplateController.getTemplatePerformance); // To be implemented

// Component routes
router.get('/components', authenticateToken, promptComponentController.getAllComponents);
router.get('/components/:id', authenticateToken, promptComponentController.getComponentById);
router.get('/components/name/:name', authenticateToken, promptComponentController.getComponentByName);
router.get('/components/name/:name/active', authenticateToken, promptComponentController.getActiveComponentByName);
router.post('/components', authenticateToken, promptComponentController.createComponent);
router.put('/components/:id', authenticateToken, promptComponentController.updateComponent);
router.post('/components/:id/activate', authenticateToken, promptComponentController.activateComponent);
router.get('/components/:id/usage', authenticateToken, promptComponentController.getComponentUsage);
router.delete('/components/:id', authenticateToken, promptComponentController.deleteComponent);

// Performance routes
router.get('/performance', authenticateToken, promptPerformanceController.getPerformanceMetrics);
router.get('/performance/templates', authenticateToken, promptPerformanceController.getPerformanceByTemplate);
router.get('/performance/timeline', authenticateToken, promptPerformanceController.getPerformanceTimeline);

export default router;