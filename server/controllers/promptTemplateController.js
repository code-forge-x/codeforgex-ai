import PromptTemplate from '../models/PromptTemplate.js';
import PromptVersionLog from '../models/PromptVersionLog.js';
import PromptPerformance from '../models/PromptPerformance.js';
import PromptParameter from '../models/PromptParameter.js';
import { diffLines, diffWords, diffWordsWithSpace } from 'diff';
import { marked } from 'marked';
import PDFDocument from 'pdfkit';
import hljs from 'highlight.js';
import Component from '../models/Component.js';
// import promptManager from '../services/promptManager.js'; // To be implemented
// import aiClient from '../services/aiClient.js'; // To be implemented
// import logger from '../utils/logger.js'; // To be implemented

// Get all templates with pagination
export const getAllTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get all templates
    const templates = await PromptTemplate.find(query)
      .populate('parameters')
      .sort({ updatedAt: -1 })
      .exec();

    // Group by name and find active versions
    const templateMap = {};
    templates.forEach(template => {
      if (!templateMap[template.name]) {
        templateMap[template.name] = {
          name: template.name,
          versions: []
        };
      }
      templateMap[template.name].versions.push(template);
      if (template.active) {
        templateMap[template.name].activeVersion = template;
      }
    });

    // Convert to array and paginate
    const templateList = Object.values(templateMap);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTemplates = templateList.slice(startIndex, endIndex);

    res.json({
      templates: paginatedTemplates,
      totalPages: Math.ceil(templateList.length / limit),
      currentPage: page,
      totalTemplates: templateList.length
    });
  } catch (error) {
    console.error('Get all templates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await PromptTemplate.findById(req.params.id).populate('parameters');
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const { name, description, category, content, tags, parameters, status } = req.body;
    
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false,
        message: 'User information is required to create a template' 
      });
    }

    // Check if a template with this name already exists
    const existingTemplate = await PromptTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: `A template with the name "${name}" already exists. Please use a different name.`
      });
    }
    
    // Create template (version 1)
    const template = new PromptTemplate({
      name,
      description,
      category,
      content,
      tags: tags || [],
      parameters: [], // Will be populated after creating parameters
      version: 1,
      active: true, // First version is automatically active
      createdBy: req.user.email
    });
    await template.save();

    // Create parameters if provided
    if (parameters && Array.isArray(parameters)) {
      const parameterPromises = parameters.map(param => {
        if (!param.name || !param.description) {
          throw new Error(`Parameter is missing required fields: name and description are required`);
        }
        const newParam = new PromptParameter({
          name: param.name,
          description: param.description,
          required: param.required || false,
          defaultValue: param.defaultValue,
          type: param.type || 'string',
          templateId: template._id
        });
        return newParam.save();
      });
      const savedParameters = await Promise.all(parameterPromises);
      template.parameters = savedParameters.map(p => p._id);
      await template.save();
    }

    // Create version log
    await PromptVersionLog.create({
      templateId: template._id,
      templateName: template.name,
      version: template.version,
      action: 'created',
      timestamp: new Date(),
      author: req.user.email,
      notes: 'Initial creation'
    });

    await template.populate('parameters');
    res.status(201).json({
      success: true,
      message: `Template ${template.name} version ${template.version} created successfully`,
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'A template with this name and version already exists. Please try again.' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all versions of a template by name
export const getTemplateVersionsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const versions = await PromptTemplate.find({ name })
      .sort({ version: 1 })
      .populate('parameters')
      .exec();

    if (!versions || versions.length === 0) {
      return res.status(404).json({ message: 'No versions found for this template' });
    }

    // Get version logs
    const logs = await PromptVersionLog.find({ templateName: name })
      .sort({ timestamp: -1 })
      .exec();

    res.json({
      templateName: name,
      versions,
      logs,
      activeVersion: versions.find(v => v.active)
    });
  } catch (error) {
    console.error('Get template versions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validate version sequence
const validateVersionSequence = async (name, newVersion) => {
  const versions = await PromptTemplate.find({ name })
    .sort({ version: 1 })
    .select('version')
    .exec();

  if (versions.length === 0) {
    return newVersion === 1;
  }

  const lastVersion = versions[versions.length - 1].version;
  return newVersion === lastVersion + 1;
};

// Update template (creates new version)
export const updateTemplate = async (req, res) => {
  try {
    const { description, category, content, tags, parameters, notes } = req.body;
    const originalTemplate = await PromptTemplate.findById(req.params.id);
    
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find the latest version number for this template
    const latestVersion = await PromptTemplate.findOne({ name: originalTemplate.name })
      .sort({ version: -1 })
      .select('version');

    const newVersionNumber = (latestVersion ? latestVersion.version : 0) + 1;

    // Validate version sequence
    const isValidSequence = await validateVersionSequence(originalTemplate.name, newVersionNumber);
    if (!isValidSequence) {
      return res.status(400).json({
        message: 'Invalid version sequence. Versions must be sequential.',
        expectedVersion: latestVersion ? latestVersion.version + 1 : 1
      });
    }

    // Create new version
    const newTemplate = new PromptTemplate({
      name: originalTemplate.name,
      description: description || originalTemplate.description,
      category: category || originalTemplate.category,
      content: content || originalTemplate.content,
      tags: tags || originalTemplate.tags,
      parameters: [],
      version: newVersionNumber,
      active: false,
      createdBy: req.user.email,
      previousVersion: originalTemplate._id
    });

    // Create parameters if provided
    if (parameters && Array.isArray(parameters)) {
      const parameterPromises = parameters.map(param => {
        if (!param.name || !param.description) {
          throw new Error(`Parameter is missing required fields: name and description are required`);
        }
        const newParam = new PromptParameter({
          name: param.name,
          description: param.description,
          required: param.required || false,
          defaultValue: param.defaultValue,
          type: param.type || 'string',
          templateId: newTemplate._id
        });
        return newParam.save();
      });
      const savedParameters = await Promise.all(parameterPromises);
      newTemplate.parameters = savedParameters.map(p => p._id);
    }

    await newTemplate.save();

    // Create version log
    await PromptVersionLog.create({
      templateId: newTemplate._id,
      templateName: newTemplate.name,
      version: newVersionNumber,
      action: 'created',
      timestamp: new Date(),
      author: req.user.email,
      notes: notes || `Created version ${newVersionNumber}`
    });

    await newTemplate.populate('parameters');
    
    res.status(201).json({
      success: true,
      template: newTemplate,
      message: `New version ${newVersionNumber} created successfully`
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Activate template
export const activateTemplate = async (req, res) => {
  try {
    const { notes } = req.body;
    const template = await PromptTemplate.findById(req.params.id).populate('parameters');
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find and deactivate current active version
    const currentActive = await PromptTemplate.findOne({ 
      name: template.name, 
      active: true,
      _id: { $ne: template._id } // Exclude the version we're activating
    });

    if (currentActive) {
      currentActive.active = false;
      await currentActive.save();
      
      // Log deactivation
      await PromptVersionLog.create({
        templateId: currentActive._id,
        templateName: currentActive.name,
        version: currentActive.version,
        action: 'deactivated',
        timestamp: new Date(),
        author: req.user?.email || 'system',
        notes: `Deactivated in favor of version ${template.version}`
      });
    }

    // Activate the new version
    template.active = true;
    await template.save();

    // Log activation
    await PromptVersionLog.create({
      templateId: template._id,
      templateName: template.name,
      version: template.version,
      action: 'activated',
      timestamp: new Date(),
      author: req.user?.email || 'system',
      notes: notes || `Activated version ${template.version}`,
      metadata: { 
        previousActiveVersion: currentActive ? currentActive.version : null 
      }
    });

    // Return the updated template with populated parameters
    const updatedTemplate = await PromptTemplate.findById(template._id).populate('parameters');
    
    res.json({
      message: `Template ${template.name} v${template.version} activated successfully`,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Activate template error:', error);
    res.status(500).json({ 
      message: 'Failed to activate template version',
      error: error.message 
    });
  }
};

// Delete template and all its versions
export const deleteTemplate = async (req, res) => {
  try {
    const template = await PromptTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find all versions of this template
    const allVersions = await PromptTemplate.find({ name: template.name });
    const versionIds = allVersions.map(v => v._id);

    // Delete all parameters associated with any version
    await PromptParameter.deleteMany({ templateId: { $in: versionIds } });

    // Delete all version logs
    await PromptVersionLog.deleteMany({ templateName: template.name });

    // Delete all performance records
    await PromptPerformance.deleteMany({ templateId: { $in: versionIds } });

    // Delete all versions of the template
    await PromptTemplate.deleteMany({ name: template.name });

    res.json({ 
      message: `Template ${template.name} and all its versions deleted successfully`,
      deletedVersions: allVersions.length
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ 
      message: 'Failed to delete template',
      error: error.message 
    });
  }
};

// Get all versions of a template
export const getTemplateVersions = async (req, res) => {
  try {
    const template = await PromptTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    // Get all versions of this template
    const versions = await PromptTemplate.find({ name: template.name })
      .sort({ version: -1 })
      .populate('parameters')
      .exec();

    // Get version logs
    const logs = await PromptVersionLog.find({ templateName: template.name })
      .sort({ timestamp: -1 })
      .exec();

    res.json({
      templateName: template.name,
      versions,
      logs,
      activeVersion: versions.find(v => v.active)
    });
  } catch (error) {
    console.error('Get template versions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Rollback to a previous version
export const rollbackTemplate = async (req, res) => {
  try {
    const { version } = req.body;
    const template = await PromptTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find the target version
    const targetVersion = await PromptTemplate.findOne({
      name: template.name,
      version: version
    });

    if (!targetVersion) {
      return res.status(404).json({ message: 'Target version not found' });
    }

    // Find the latest version number
    const latestVersion = await PromptTemplate.findOne({ name: template.name })
      .sort({ version: -1 })
      .select('version');

    const newVersionNumber = (latestVersion ? latestVersion.version : 0) + 1;

    // Create new version based on the target version
    const newTemplate = new PromptTemplate({
      name: template.name,
      description: targetVersion.description,
      category: targetVersion.category,
      content: targetVersion.content,
      tags: targetVersion.tags,
      parameters: [],
      version: newVersionNumber,
      active: false,
      createdBy: req.user.email,
      previousVersion: template._id
    });

    // Copy parameters from target version
    if (targetVersion.parameters && targetVersion.parameters.length > 0) {
      const parameterPromises = targetVersion.parameters.map(param => {
        const newParam = new PromptParameter({
          name: param.name,
          description: param.description,
          required: param.required,
          defaultValue: param.defaultValue,
          type: param.type,
          templateId: newTemplate._id
        });
        return newParam.save();
      });
      const savedParameters = await Promise.all(parameterPromises);
      newTemplate.parameters = savedParameters.map(p => p._id);
    }

    await newTemplate.save();

    // Create version log
    await PromptVersionLog.create({
      templateId: newTemplate._id,
      templateName: newTemplate.name,
      version: newVersionNumber,
      action: 'rollback',
      timestamp: new Date(),
      author: req.user.email,
      notes: `Rolled back to version ${version}`,
      metadata: {
        rolledBackFrom: template.version,
        rolledBackTo: version
      }
    });

    await newTemplate.populate('parameters');
    
    res.status(201).json({
      success: true,
      template: newTemplate,
      message: `Successfully rolled back to version ${version} and created new version ${newVersionNumber}`
    });
  } catch (error) {
    console.error('Rollback template error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Compare two versions with detailed diff
export const compareVersions = async (req, res) => {
  try {
    const { version1, version2 } = req.params;
    const template = await PromptTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find both versions
    const [v1, v2] = await Promise.all([
      PromptTemplate.findOne({ name: template.name, version: version1 }).populate('parameters'),
      PromptTemplate.findOne({ name: template.name, version: version2 }).populate('parameters')
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ message: 'One or both versions not found' });
    }

    // Generate detailed diffs
    const contentDiff = generateDiff(v1.content, v2.content);
    const descriptionDiff = generateDiff(v1.description, v2.description);
    
    // Compare parameters
    const paramDiffs = compareParameters(v1.parameters, v2.parameters);
    
    // Compare tags
    const tagDiffs = compareTags(v1.tags, v2.tags);

    // Compare metadata
    const metadataDiffs = {
      category: v1.category !== v2.category ? {
        from: v1.category,
        to: v2.category
      } : null,
      active: v1.active !== v2.active ? {
        from: v1.active,
        to: v2.active
      } : null
    };

    res.json({
      version1: {
        version: v1.version,
        createdAt: v1.createdAt,
        createdBy: v1.createdBy
      },
      version2: {
        version: v2.version,
        createdAt: v2.createdAt,
        createdBy: v2.createdBy
      },
      diffs: {
        content: contentDiff,
        description: descriptionDiff,
        parameters: paramDiffs,
        tags: tagDiffs,
        metadata: metadataDiffs
      },
      summary: {
        contentChanged: contentDiff.changes > 0,
        descriptionChanged: descriptionDiff.changes > 0,
        parametersChanged: paramDiffs.changes > 0,
        tagsChanged: tagDiffs.changes > 0,
        metadataChanged: Object.values(metadataDiffs).some(diff => diff !== null)
      }
    });
  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get detailed diff between two versions with enhanced features
export const getVersionDiff = async (req, res) => {
  try {
    const { version1, version2, format = 'json' } = req.params;
    const template = await PromptTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Find both versions
    const [v1, v2] = await Promise.all([
      PromptTemplate.findOne({ name: template.name, version: version1 }).populate('parameters'),
      PromptTemplate.findOne({ name: template.name, version: version2 }).populate('parameters')
    ]);

    if (!v1 || !v2) {
      return res.status(404).json({ message: 'One or both versions not found' });
    }

    // Generate diffs
    const lineDiff = generateLineDiff(v1.content, v2.content);
    const wordDiff = generateWordDiff(v1.content, v2.content);
    const sideBySideDiff = generateSideBySideDiff(v1.content, v2.content);
    const syntaxHighlightedDiff = generateSyntaxHighlightedDiff(v1.content, v2.content);
    
    // Generate statistics
    const stats = generateDiffStats(v1, v2);

    const diffData = {
      version1: {
        version: v1.version,
        createdAt: v1.createdAt,
        createdBy: v1.createdBy
      },
      version2: {
        version: v2.version,
        createdAt: v2.createdAt,
        createdBy: v2.createdBy
      },
      diffs: {
        line: lineDiff,
        word: wordDiff,
        sideBySide: sideBySideDiff,
        syntaxHighlighted: syntaxHighlightedDiff
      },
      statistics: stats
    };

    // Handle different export formats
    switch (format.toLowerCase()) {
      case 'html':
        return res.send(generateHtmlDiff(diffData));
      case 'pdf':
        return generatePdfDiff(diffData, res);
      case 'markdown':
        return res.send(generateMarkdownDiff(diffData));
      default:
        return res.json(diffData);
    }
  } catch (error) {
    console.error('Get version diff error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Generate side-by-side diff
const generateSideBySideDiff = (oldText, newText) => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const maxLength = Math.max(oldLines.length, newLines.length);
  const result = [];

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (oldLine === newLine) {
      result.push({
        type: 'unchanged',
        oldLine: { content: oldLine, number: i + 1 },
        newLine: { content: newLine, number: i + 1 }
      });
    } else {
      result.push({
        type: 'changed',
        oldLine: { content: oldLine, number: i + 1 },
        newLine: { content: newLine, number: i + 1 }
      });
    }
  }

  return result;
};

// Generate syntax highlighted diff
const generateSyntaxHighlightedDiff = (oldText, newText) => {
  const diff = diffWords(oldText, newText);
  return diff.map(part => {
    try {
      const highlighted = hljs.highlight(part.value, { language: 'javascript' }).value;
      return {
        type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
        content: part.value,
        highlighted
      };
    } catch (error) {
      // Fallback if highlighting fails
      return {
        type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
        content: part.value,
        highlighted: part.value
      };
    }
  });
};

// Generate diff statistics
const generateDiffStats = (v1, v2) => {
  const contentStats = {
    lines: {
      total: v2.content.split('\n').length,
      added: v2.content.split('\n').length - v1.content.split('\n').length,
      removed: v1.content.split('\n').length - v2.content.split('\n').length
    },
    words: {
      total: v2.content.split(/\s+/).length,
      added: v2.content.split(/\s+/).length - v1.content.split(/\s+/).length,
      removed: v1.content.split(/\s+/).length - v2.content.split(/\s+/).length
    },
    characters: {
      total: v2.content.length,
      added: v2.content.length - v1.content.length,
      removed: v1.content.length - v2.content.length
    }
  };

  const paramStats = {
    total: v2.parameters.length,
    added: v2.parameters.length - v1.parameters.length,
    removed: v1.parameters.length - v2.parameters.length,
    modified: v1.parameters.filter(p1 => 
      v2.parameters.some(p2 => p2.name === p1.name && JSON.stringify(p2) !== JSON.stringify(p1))
    ).length
  };

  const tagStats = {
    total: v2.tags.length,
    added: v2.tags.filter(t => !v1.tags.includes(t)).length,
    removed: v1.tags.filter(t => !v2.tags.includes(t)).length
  };

  return {
    content: contentStats,
    parameters: paramStats,
    tags: tagStats,
    summary: {
      totalChanges: contentStats.lines.added + contentStats.lines.removed +
                   paramStats.added + paramStats.removed + paramStats.modified +
                   tagStats.added + tagStats.removed
    }
  };
};

// Generate HTML diff
const generateHtmlDiff = (diffData) => {
  const { version1, version2, diffs, statistics } = diffData;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Diff: ${version1.version} → ${version2.version}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
        <style>
          .diff-container { display: flex; gap: 20px; }
          .diff-side { flex: 1; }
          .line { font-family: monospace; }
          .added { background-color: #e6ffed; }
          .removed { background-color: #ffeef0; }
          .unchanged { background-color: white; }
          .stats { margin: 20px 0; }
          .stats-table { border-collapse: collapse; width: 100%; }
          .stats-table td, .stats-table th { border: 1px solid #ddd; padding: 8px; }
          pre { margin: 0; padding: 10px; }
          code { font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Diff: Version ${version1.version} → ${version2.version}</h1>
        
        <div class="stats">
          <h2>Statistics</h2>
          <table class="stats-table">
            <tr>
              <th>Metric</th>
              <th>Added</th>
              <th>Removed</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>Lines</td>
              <td>${statistics.content.lines.added}</td>
              <td>${statistics.content.lines.removed}</td>
              <td>${statistics.content.lines.total}</td>
            </tr>
            <tr>
              <td>Words</td>
              <td>${statistics.content.words.added}</td>
              <td>${statistics.content.words.removed}</td>
              <td>${statistics.content.words.total}</td>
            </tr>
            <tr>
              <td>Parameters</td>
              <td>${statistics.parameters.added}</td>
              <td>${statistics.parameters.removed}</td>
              <td>${statistics.parameters.total}</td>
            </tr>
          </table>
        </div>

        <div class="diff-container">
          <div class="diff-side">
            <h3>Version ${version1.version}</h3>
            ${diffs.sideBySide.map(line => `
              <div class="line ${line.type}">
                <span class="line-number">${line.oldLine.number}</span>
                <pre><code class="language-javascript">${line.oldLine.content}</code></pre>
              </div>
            `).join('')}
          </div>
          <div class="diff-side">
            <h3>Version ${version2.version}</h3>
            ${diffs.sideBySide.map(line => `
              <div class="line ${line.type}">
                <span class="line-number">${line.newLine.number}</span>
                <pre><code class="language-javascript">${line.newLine.content}</code></pre>
              </div>
            `).join('')}
          </div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
        <script>hljs.highlightAll();</script>
      </body>
    </html>
  `;
};

// Generate PDF diff
const generatePdfDiff = (diffData, res) => {
  const doc = new PDFDocument();
  const { version1, version2, diffs, statistics } = diffData;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=diff-${version1.version}-${version2.version}.pdf`);
  
  doc.pipe(res);
  
  // Add title
  doc.fontSize(20).text(`Diff: Version ${version1.version} → ${version2.version}`, { align: 'center' });
  doc.moveDown();

  // Add statistics
  doc.fontSize(16).text('Statistics');
  doc.fontSize(12);
  doc.text(`Lines: +${statistics.content.lines.added} -${statistics.content.lines.removed}`);
  doc.text(`Words: +${statistics.content.words.added} -${statistics.content.words.removed}`);
  doc.text(`Parameters: +${statistics.parameters.added} -${statistics.parameters.removed}`);
  doc.moveDown();

  // Add side-by-side diff
  doc.fontSize(16).text('Changes');
  doc.fontSize(10);
  
  diffs.sideBySide.forEach(line => {
    if (line.type !== 'unchanged') {
      doc.text(`Line ${line.oldLine.number}: ${line.oldLine.content}`, { continued: true });
      doc.text(` → ${line.newLine.content}`, { color: 'red' });
    }
  });

  doc.end();
};

// Generate Markdown diff
const generateMarkdownDiff = (diffData) => {
  const { version1, version2, diffs, statistics } = diffData;
  
  let markdown = `# Diff: Version ${version1.version} → ${version2.version}\n\n`;
  
  // Add statistics
  markdown += `## Statistics\n\n`;
  markdown += `| Metric | Added | Removed | Total |\n`;
  markdown += `|--------|-------|---------|-------|\n`;
  markdown += `| Lines | ${statistics.content.lines.added} | ${statistics.content.lines.removed} | ${statistics.content.lines.total} |\n`;
  markdown += `| Words | ${statistics.content.words.added} | ${statistics.content.words.removed} | ${statistics.content.words.total} |\n`;
  markdown += `| Parameters | ${statistics.parameters.added} | ${statistics.parameters.removed} | ${statistics.parameters.total} |\n\n`;
  
  // Add diff
  markdown += `## Changes\n\n`;
  markdown += `\`\`\`diff\n`;
  
  diffs.sideBySide.forEach(line => {
    if (line.type === 'changed') {
      markdown += `- ${line.oldLine.content}\n`;
      markdown += `+ ${line.newLine.content}\n`;
    }
  });
  
  markdown += `\`\`\`\n`;
  
  return markdown;
};

// Helper functions for diff generation
const generateDiff = (oldText, newText) => {
  const lines = {
    added: [],
    removed: [],
    unchanged: []
  };

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  let i = 0, j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      lines.added.push({ line: newLines[j], number: j + 1 });
      j++;
    } else if (j >= newLines.length) {
      lines.removed.push({ line: oldLines[i], number: i + 1 });
      i++;
    } else if (oldLines[i] === newLines[j]) {
      lines.unchanged.push({ line: oldLines[i], number: i + 1 });
      i++;
      j++;
    } else {
      lines.removed.push({ line: oldLines[i], number: i + 1 });
      lines.added.push({ line: newLines[j], number: j + 1 });
      i++;
      j++;
    }
  }

  return {
    changes: lines.added.length + lines.removed.length,
    added: lines.added,
    removed: lines.removed,
    unchanged: lines.unchanged
  };
};

const generateLineDiff = (oldText, newText) => {
  const diff = generateDiff(oldText, newText);
  return {
    ...diff,
    unified: diff.unchanged.map(u => ({ type: 'unchanged', ...u }))
      .concat(diff.removed.map(r => ({ type: 'removed', ...r })))
      .concat(diff.added.map(a => ({ type: 'added', ...a })))
      .sort((a, b) => a.number - b.number)
  };
};

const generateWordDiff = (oldText, newText) => {
  const words = {
    added: [],
    removed: [],
    unchanged: []
  };

  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);

  let i = 0, j = 0;
  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      words.added.push(newWords[j]);
      j++;
    } else if (j >= newWords.length) {
      words.removed.push(oldWords[i]);
      i++;
    } else if (oldWords[i] === newWords[j]) {
      words.unchanged.push(oldWords[i]);
      i++;
      j++;
    } else {
      words.removed.push(oldWords[i]);
      words.added.push(newWords[j]);
      i++;
      j++;
    }
  }

  return {
    changes: words.added.length + words.removed.length,
    added: words.added,
    removed: words.removed,
    unchanged: words.unchanged
  };
};

const compareParameters = (params1, params2) => {
  const changes = {
    added: [],
    removed: [],
    modified: [],
    unchanged: []
  };

  const paramMap1 = new Map(params1.map(p => [p.name, p]));
  const paramMap2 = new Map(params2.map(p => [p.name, p]));

  // Find added and modified parameters
  for (const [name, param2] of paramMap2) {
    if (!paramMap1.has(name)) {
      changes.added.push(param2);
    } else {
      const param1 = paramMap1.get(name);
      if (JSON.stringify(param1) !== JSON.stringify(param2)) {
        changes.modified.push({
          name,
          from: param1,
          to: param2
        });
      } else {
        changes.unchanged.push(param2);
      }
    }
  }

  // Find removed parameters
  for (const [name, param1] of paramMap1) {
    if (!paramMap2.has(name)) {
      changes.removed.push(param1);
    }
  }

  return {
    changes: changes.added.length + changes.removed.length + changes.modified.length,
    ...changes
  };
};

const compareTags = (tags1, tags2) => {
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);

  const added = tags2.filter(tag => !set1.has(tag));
  const removed = tags1.filter(tag => !set2.has(tag));
  const unchanged = tags1.filter(tag => set2.has(tag));

  return {
    changes: added.length + removed.length,
    added,
    removed,
    unchanged
  };
};

// Generate template preview
export const generatePreview = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Find all component references in the content
    const componentRegex = /{{ include ([^}]+) }}/g;
    let match;
    const componentNames = new Set();
    
    while ((match = componentRegex.exec(content)) !== null) {
      componentNames.add(match[1].trim());
    }

    // Fetch all referenced components
    const components = await Component.find({
      name: { $in: Array.from(componentNames) },
      active: true
    });

    // Create a map of component names to their content
    const componentMap = new Map(
      components.map(component => [component.name, component.content])
    );

    // Replace component references with their content
    let previewContent = content;
    for (const [name, componentContent] of componentMap) {
      const regex = new RegExp(`{{ include ${name} }}`, 'g');
      previewContent = previewContent.replace(regex, componentContent);
    }

    // Replace any remaining component references with error messages
    previewContent = previewContent.replace(
      /{{ include ([^}]+) }}/g,
      '[ERROR: Component "$1" not found]'
    );

    res.json({
      success: true,
      preview: previewContent
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating preview',
      error: error.message 
    });
  }
};

export default {
  getAllTemplates,
  getTemplateById,
  getTemplateByName,
  getActiveTemplateByName,
  createTemplate,
  updateTemplate,
  activateTemplate,
  deleteTemplate,
  getTemplateVersions,
  getTemplateVersionsByName,
  rollbackTemplate,
  compareVersions,
  getVersionDiff,
  generatePreview
};