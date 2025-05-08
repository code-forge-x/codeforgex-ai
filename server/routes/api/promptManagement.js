import express from 'express';
import promptTemplateController from '../../controllers/promptTemplateController.js';
import promptComponentController from '../../controllers/promptComponentController.js';
import promptPerformanceController from '../../controllers/promptPerformanceController.js';

const router = express.Router();

// Placeholder middleware for auth and admin
const auth = (req, res, next) => { req.user = { email: 'admin@codeforgex.com' }; next(); };
const admin = (req, res, next) => { next(); };

// Require admin role for all routes in this router
router.use(auth, admin);

// Template routes
router.get('/templates', promptTemplateController.getAllTemplates);
router.get('/templates/:id', promptTemplateController.getTemplateById);
router.get('/templates/name/:name', promptTemplateController.getTemplateByName);
router.get('/templates/name/:name/active', promptTemplateController.getActiveTemplateByName);
router.post('/templates', promptTemplateController.createTemplate);
router.put('/templates/:id', promptTemplateController.updateTemplate);
router.post('/templates/:id/activate', promptTemplateController.activateTemplate);
// router.post('/templates/:id/test', promptTemplateController.testTemplate); // To be implemented
// router.get('/templates/:id/versions', promptTemplateController.getTemplateVersions); // To be implemented
// router.get('/templates/:id/compare/:versionId', promptTemplateController.compareTemplateVersions); // To be implemented
// router.get('/templates/:id/performance', promptTemplateController.getTemplatePerformance); // To be implemented

// Component routes
router.get('/components', promptComponentController.getAllComponents);
router.get('/components/:id', promptComponentController.getComponentById);
router.get('/components/name/:name', promptComponentController.getComponentByName);
router.get('/components/name/:name/active', promptComponentController.getActiveComponentByName);
router.post('/components', promptComponentController.createComponent);
router.put('/components/:id', promptComponentController.updateComponent);
router.post('/components/:id/activate', promptComponentController.activateComponent);
router.get('/components/:id/usage', promptComponentController.getComponentUsage);

// Performance routes
router.get('/performance', promptPerformanceController.getPerformanceMetrics);
router.get('/performance/templates', promptPerformanceController.getPerformanceByTemplate);
router.get('/performance/timeline', promptPerformanceController.getPerformanceTimeline);

export default router;