import express from 'express';
import { parseComponentFile } from '../../utils/componentParser.js';
import Component from '../../models/Component.js';
import { convertTemplateToStandardJSON, detectFormat } from '../../utils/templateConverter.js';

const router = express.Router();

// 1. Parse endpoint
router.post('/parse', async (req, res) => {
  try {
    const { content, fileType } = req.body; // fileType: 'json', 'yml', 'txt'
    const components = parseComponentFile(content, fileType);
    res.json({ success: true, components });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Validate endpoint
router.post('/validate', async (req, res) => {
  try {
    const { components } = req.body;
    const requiredFields = ['component_id', 'component_version', 'description', 'content'];
    const valid = [];
    const invalid = [];

    // Helper to validate and convert parameter type
    const validateParameterType = (param) => {
      const type = param.type?.toLowerCase() || 'string';
      const value = param.default;
      
      // Common type mappings
      const typeMap = {
        'bool': 'boolean',
        'int': 'number',
        'float': 'number',
        'double': 'number',
        'str': 'string',
        'list': 'array',
        'dict': 'object'
      };

      // Normalize type
      const normalizedType = typeMap[type] || type;

      // Validate type
      if (!['string', 'number', 'boolean', 'array', 'object'].includes(normalizedType)) {
        return `Parameter ${param.name} has invalid type: ${type}`;
      }

      // Convert default value if needed
      if (value !== undefined) {
        try {
          switch (normalizedType) {
            case 'boolean':
              if (typeof value === 'string') {
                param.default = value.toLowerCase() === 'true';
              }
              break;
            case 'number':
              if (typeof value === 'string') {
                param.default = Number(value);
              }
              break;
            case 'array':
              if (typeof value === 'string') {
                param.default = JSON.parse(value.replace(/'/g, '"'));
              }
              break;
          }
        } catch (e) {
          return `Parameter ${param.name} has invalid default value for type ${normalizedType}`;
        }
      }

      // Update the type to normalized version
      param.type = normalizedType;
      return null;
    };

    for (const comp of components) {
      const errors = [];
      
      // Check required fields
      const missing = requiredFields.filter(f => !comp[f]);
      if (missing.length) {
        errors.push(`Missing required fields: ${missing.join(', ')}`);
      }

      // Validate parameters structure
      if (comp.parameters) {
        if (!Array.isArray(comp.parameters)) {
          errors.push('Parameters must be an array');
        } else {
          comp.parameters.forEach((param, idx) => {
            if (!param.name) {
              errors.push(`Parameter ${idx + 1} is missing a name`);
            } else {
              const typeError = validateParameterType(param);
              if (typeError) {
                errors.push(typeError);
              }
            }
            if (param.options && !Array.isArray(param.options)) {
              errors.push(`Parameter ${param.name} has invalid options format`);
            }
          });
        }
      }

      // Validate field types
      if (comp.component_version && typeof comp.component_version !== 'string') {
        errors.push('Component version must be a string');
      }
      if (comp.tags && !Array.isArray(comp.tags)) {
        errors.push('Tags must be an array');
      }
      if (comp.type && typeof comp.type !== 'string') {
        errors.push('Type must be a string');
      }

      // Always use auto-detected type
      let detectedType = detectFormat(comp.content || JSON.stringify(comp));
      if (typeof detectedType !== 'string') detectedType = String(detectedType);
      const compWithType = { ...comp, type: detectedType };

      if (errors.length) {
        invalid.push({ ...compWithType, error: errors.join('; ') });
      } else {
        valid.push(compWithType);
      }
    }

    res.json({ success: true, valid, invalid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Import endpoint
router.post('/import', async (req, res) => {
  try {
    const { components } = req.body;
    const inserted = [];
    const errors = [];
    for (const comp of components) {
      try {
        // Map incoming fields to schema fields
        const parseIfJsonArray = (val) => {
          if (typeof val === 'string' && val.trim().startsWith('[') && val.trim().endsWith(']')) {
            try { return JSON.parse(val); } catch { return val; }
          }
          return val;
        };

        // Normalize parameters
        const normalizeParams = (params) => {
          if (!params) return [];
          if (!Array.isArray(params)) return [params];
          return params.map(param => ({
            name: param.name || '',
            type: param.type || 'string',
            description: param.description || '',
            default: param.default,
            options: Array.isArray(param.options) ? param.options : 
                     (typeof param.options === 'string' ? JSON.parse(param.options.replace(/'/g, '"')) : []),
            required: !!param.required
          }));
        };

        let detectedType = detectFormat(comp.content || JSON.stringify(comp));
        if (typeof detectedType !== 'string') detectedType = String(detectedType);
        
        const mapped = {
          name: comp.name || comp.component_id || '',
          title: comp.title || '',
          description: comp.description || 'No description provided.',
          content: comp.content || '',
          tags: Array.isArray(comp.tags) ? comp.tags : [],
          version: typeof comp.version === 'number' ? comp.version : 1,
          component_version: comp.component_version || '',
          active: typeof comp.active === 'boolean' ? comp.active : true,
          createdBy: comp.createdBy && comp.createdBy !== '' ? comp.createdBy : 'system',
          updatedBy: comp.updatedBy && comp.updatedBy !== '' ? comp.updatedBy : 'system',
          usageCount: typeof comp.usageCount === 'number' ? comp.usageCount : 0,
          metadata: comp.metadata || {},
          dependent_components: parseIfJsonArray(comp.dependent_components),
          required_by: parseIfJsonArray(comp.required_by),
          default: parseIfJsonArray(comp.default),
          tested_versions: parseIfJsonArray(comp.tested_versions),
          type: detectedType,
          parameters: normalizeParams(comp.parameters)
        };

        const saved = await new Component(mapped).save();
        inserted.push(saved);
      } catch (err) {
        errors.push({ component_id: comp.component_id, error: err.message });
      }
    }
    res.json({ success: true, inserted, errors });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Unified import endpoint for MVP
router.post('/unified-import', async (req, res) => {
  try {
    const { content, type, options } = req.body;
    if (!content) return res.status(400).json({ error: "No content provided" });

    // 1. Detect format if not specified
    const detectedType = type || detectFormat(content);

    // 2. Convert to standard structure
    const template = convertTemplateToStandardJSON(content);
    template.type = detectedType;

    // 3. Validate core required fields
    const errors = [];
    if (!template.name) errors.push("Name is required");
    if (!template.content) errors.push("Content is required");
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    // 4. Save to database (if not preview)
    if (!options || !options.preview) {
      const saved = await Component.create(template);
      return res.json({ success: true, message: "Template imported successfully", template: saved });
    }

    // 5. Preview only
    return res.json({ success: true, template });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router; 