import PromptTemplate from '../models/PromptTemplate.js';
import PromptVersionLog from '../models/PromptVersionLog.js';
import PromptPerformance from '../models/PromptPerformance.js';
// import promptManager from '../services/promptManager.js'; // To be implemented
// import aiClient from '../services/aiClient.js'; // To be implemented
// import logger from '../utils/logger.js'; // To be implemented

// Get all templates with pagination
export const getAllTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, active, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (active !== undefined) query.active = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const templates = await PromptTemplate.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await PromptTemplate.countDocuments(query);
    res.json({
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTemplates: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await PromptTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get template by name (all versions)
export const getTemplateByName = async (req, res) => {
  try {
    const templates = await PromptTemplate.find({ name: req.params.name }).sort({ version: -1 });
    if (!templates || templates.length === 0) return res.status(404).json({ message: 'Template not found' });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active template by name
export const getActiveTemplateByName = async (req, res) => {
  try {
    const template = await PromptTemplate.findOne({ name: req.params.name, active: true });
    if (!template) return res.status(404).json({ message: 'Active template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const { name, description, category, content, tags, parameters } = req.body;
    const existingTemplate = await PromptTemplate.findOne({ name });
    if (existingTemplate) return res.status(400).json({ message: 'Template with this name already exists' });
    const template = new PromptTemplate({
      name,
      description,
      category,
      content,
      tags: tags || [],
      parameters: parameters || [],
      version: 1,
      active: false,
      createdBy: req.user.email
    });
    await template.save();
    await PromptVersionLog.create({
      templateId: template._id,
      templateName: template.name,
      version: template.version,
      action: 'created',
      timestamp: new Date(),
      author: req.user.email,
      notes: req.body.notes || 'Initial creation'
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update template (creates new version)
export const updateTemplate = async (req, res) => {
  try {
    const { description, category, content, tags, parameters, notes } = req.body;
    const currentTemplate = await PromptTemplate.findById(req.params.id);
    if (!currentTemplate) return res.status(404).json({ message: 'Template not found' });
    const newTemplate = new PromptTemplate({
      name: currentTemplate.name,
      description: description || currentTemplate.description,
      category: category || currentTemplate.category,
      content: content || currentTemplate.content,
      tags: tags || currentTemplate.tags,
      parameters: parameters || currentTemplate.parameters,
      version: currentTemplate.version + 1,
      active: false,
      createdBy: req.user.email,
      previousVersion: currentTemplate._id
    });
    await newTemplate.save();
    await PromptVersionLog.create({
      templateId: newTemplate._id,
      templateName: newTemplate.name,
      version: newTemplate.version,
      action: 'created',
      timestamp: new Date(),
      author: req.user.email,
      notes: notes || `Update to version ${newTemplate.version}`
    });
    res.status(200).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate template
export const activateTemplate = async (req, res) => {
  try {
    const { notes } = req.body;
    const template = await PromptTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    const currentActive = await PromptTemplate.findOne({ name: template.name, active: true });
    if (currentActive && !currentActive._id.equals(template._id)) {
      currentActive.active = false;
      await currentActive.save();
      await PromptVersionLog.create({
        templateId: currentActive._id,
        templateName: currentActive.name,
        version: currentActive.version,
        action: 'deactivated',
        timestamp: new Date(),
        author: req.user.email,
        notes: `Deactivated in favor of version ${template.version}`
      });
    }
    template.active = true;
    await template.save();
    await PromptVersionLog.create({
      templateId: template._id,
      templateName: template.name,
      version: template.version,
      action: 'activated',
      timestamp: new Date(),
      author: req.user.email,
      notes: notes || `Activated version ${template.version}`,
      metadata: { previousActiveVersion: currentActive ? currentActive.version : null }
    });
    res.status(200).json({
      message: `Template ${template.name} v${template.version} activated successfully`,
      template
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Other endpoints (testTemplate, getTemplateVersions, compareTemplateVersions, getTemplatePerformance) to be implemented after services are in place.