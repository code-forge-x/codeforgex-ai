// Core conversion/standardization utility for template import

export function normalizeParameters(jsonData) {
  // Convert empty string to empty array
  if (jsonData.parameters === "") return [];

  // Convert string to structured data if possible
  if (typeof jsonData.parameters === 'string' && jsonData.parameters) {
    try { return JSON.parse(jsonData.parameters); }
    catch(e) { return []; }
  }

  // Use default array structure if available
  if (jsonData.type && jsonData.default) {
    return [{
      name: "default",
      type: jsonData.type,
      default: jsonData.default
    }];
  }

  return Array.isArray(jsonData.parameters) ? jsonData.parameters : [];
}

export function convertTemplateToStandardJSON(rawContent, jsonData = null) {
  // If jsonData is not provided, try to parse from rawContent
  let parsed = jsonData;
  if (!parsed) {
    try {
      parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    } catch {
      parsed = {};
    }
  }

  // Standardize structure
  const template = {
    name: parsed.title || parsed.component_id || "Untitled",
    category: parsed.category || "uncategorized",
    version: parsed.component_version || "1.0",
    description: parsed.description || "",
    parameters: normalizeParameters(parsed),
    content: parsed.content || (typeof rawContent === 'string' ? rawContent : ''),
    tags: parsed.tags || [],
    active: true,
    metadata: {}
  };

  // Move extra fields to metadata
  Object.keys(parsed).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(template, key)) {
      template.metadata[key] = parsed[key];
    }
  });

  return template;
}

// Improved auto-detect template format/type with user-friendly labels
export function detectFormat(content) {
  // Try parsing as JSON first
  try {
    JSON.parse(content);
    return "JSON";
  } catch(e) {
    // Not JSON, continue detection
  }

  // Check for component_id
  if (typeof content === 'string' && content.match(/component_id\s*[:=]/)) {
    // Check for MQL5 patterns
    if (content.includes('MQL5') || content.match(/\bclass\s+C[A-Za-z]+/)) {
      return "MQL5 Component";
    }
    return "Component";
  }

  // Check for template_id
  if (typeof content === 'string' && content.match(/template_id\s*[:=]/)) {
    return "Template";
  }

  // Check for MQL5 documentation patterns
  if (typeof content === 'string' && (content.includes('MQL5') || content.match(/\bclass\s+C[A-Za-z]+/))) {
    return "MQL5 Component";
  }

  // Check for Python code blocks
  if (typeof content === 'string' && (content.includes("```python") ||
      (content.includes("def ") && content.includes(":")))) {
    return "Python Component";
  }

  // Default format
  return "General Template";
} 