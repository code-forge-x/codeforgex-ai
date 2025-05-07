const PromptTemplate = require('../models/PromptTemplate');
const PromptComponent = require('../models/PromptComponent');
const PromptPerformance = require('../models/PromptPerformance');
// const logger = require('../utils/logger'); // To be implemented

class PromptManager {
  constructor() {
    this.promptCache = new Map();
    this.componentCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getPrompt(templateName, parameters = {}) {
    // Get the active template with this name
    const template = await this.getActiveTemplate(templateName);
    if (!template) throw new Error(`Prompt template not found: ${templateName}`);
    // Assemble the complete prompt from components
    const prompt = await this.assemblePrompt(template, parameters);
    // Create performance record for tracking
    const performance = new PromptPerformance({
      templateId: template._id,
      templateName: template.name,
      templateVersion: template.version,
      parameters: JSON.stringify(parameters),
      createdAt: new Date()
    });
    await performance.save();
    return {
      prompt: prompt.prompt,
      performanceId: performance._id,
      template: {
        id: template._id,
        name: template.name,
        version: template.version
      }
    };
  }

  async getActiveTemplate(name) {
    const cacheKey = `template_${name}`;
    const cachedTemplate = this.promptCache.get(cacheKey);
    if (cachedTemplate && Date.now() - cachedTemplate.cachedAt < this.cacheExpiry) {
      return cachedTemplate.data;
    }
    const template = await PromptTemplate.findOne({ name, active: true });
    if (template) {
      this.promptCache.set(cacheKey, { data: template, cachedAt: Date.now() });
    }
    return template;
  }

  async assemblePrompt(template, parameters = {}) {
    let prompt = template.content;
    prompt = await this.processComponentIncludes(prompt);
    prompt = this.processConditionalSections(prompt, parameters);
    prompt = this.replacePlaceholders(prompt, parameters);
    return {
      prompt,
      template: {
        id: template._id,
        name: template.name,
        version: template.version
      }
    };
  }

  async processComponentIncludes(content) {
    let processedContent = content;
    const componentMatches = content.match(/{{\s*include\s+([a-zA-Z0-9_-]+)\s*}}/g);
    if (componentMatches) {
      for (const match of componentMatches) {
        const componentName = match.match(/{{\s*include\s+([a-zA-Z0-9_-]+)\s*}}/)[1];
        const componentContent = await this.getComponentContent(componentName);
        processedContent = processedContent.replace(match, componentContent);
      }
    }
    return processedContent;
  }

  async getComponentContent(name) {
    const cacheKey = `component_${name}`;
    const cachedComponent = this.componentCache.get(cacheKey);
    if (cachedComponent && Date.now() - cachedComponent.cachedAt < this.cacheExpiry) {
      return cachedComponent.data.content;
    }
    const component = await PromptComponent.findOne({ name, active: true });
    if (!component) {
      return `[Component not found: ${name}]`;
    }
    this.componentCache.set(cacheKey, { data: component, cachedAt: Date.now() });
    return component.content;
  }

  processConditionalSections(content, parameters = {}) {
    let processedContent = content;
    const conditionalMatches = content.match(/{{\s*if\s+([a-zA-Z0-9_-]+)\s*}}([\s\S]*?){{\s*endif\s*}}/g);
    if (conditionalMatches) {
      for (const match of conditionalMatches) {
        const paramName = match.match(/{{\s*if\s+([a-zA-Z0-9_-]+)\s*}}/)[1];
        const conditionalContent = match.match(/{{\s*if\s+[a-zA-Z0-9_-]+\s*}}([\s\S]*?){{\s*endif\s*}}/)[1];
        if (parameters[paramName]) {
          processedContent = processedContent.replace(match, conditionalContent);
        } else {
          processedContent = processedContent.replace(match, '');
        }
      }
    }
    return processedContent;
  }

  replacePlaceholders(content, parameters = {}) {
    let processedContent = content;
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== null) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        const replacementValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        processedContent = processedContent.replace(placeholder, replacementValue);
      }
    }
    return processedContent;
  }

  extractComponentNames(content) {
    const componentRegex = /{{\s*include\s+([a-zA-Z0-9_-]+)\s*}}/g;
    const components = [];
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      components.push(match[1]);
    }
    return [...new Set(components)];
  }

  async trackPerformance(performanceId, metrics) {
    try {
      await PromptPerformance.findByIdAndUpdate(performanceId, {
        success: metrics.success,
        tokenUsage: metrics.tokenUsage,
        latency: metrics.latency,
        completedAt: new Date(),
        error: metrics.error
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  clearCache() {
    this.promptCache.clear();
    this.componentCache.clear();
  }
}

module.exports = new PromptManager(); 