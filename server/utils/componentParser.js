import yaml from 'js-yaml';

// Clean input: remove non-YAML headers, trim whitespace, split on delimiters
function cleanInput(content) {
  let cleaned = content.trim();
  // Remove common non-YAML headers
  cleaned = cleaned.replace(/^(---|Document:|#.*|\s*Format:.*|\s*Templates?:.*)\n+/gim, '');
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

// Normalize parameter structure
function normalizeParameters(params) {
  if (!params) return [];
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(params)) {
    // Convert single parameter to array
    if (typeof params === 'object') {
      return [params];
    }
    return [];
  }
  return params.map(param => ({
    name: param.name || '',
    type: param.type || 'string',
    description: param.description || '',
    default: param.default,
    options: Array.isArray(param.options) ? param.options : 
             (typeof param.options === 'string' ? JSON.parse(param.options.replace(/'/g, '"')) : []),
    required: !!param.required,
    semantic_type: param.semantic_type || '',
    validation: param.validation || undefined
  }));
}

// Normalize field names
function normalizeFieldNames(obj) {
  const fieldMap = {
    yamlcomponent_id: 'component_id',
    component_id: 'component_id',
    name: 'name',
    title: 'title',
    version: 'component_version',
    component_version: 'component_version',
    description: 'description',
    content: 'content',
    parameters: 'parameters',
    tags: 'tags',
    type: 'type',
    category: 'category',
    subcategory: 'subcategory'
  };

  const normalized = {};
  Object.entries(obj).forEach(([key, value]) => {
    const normalizedKey = fieldMap[key] || key;
    normalized[normalizedKey] = value;
  });
  return normalized;
}

function parseJSONorYAML(content) {
  try {
    // Try JSON first
    return JSON.parse(content);
  } catch {
    // Try YAML
    return yaml.load(content);
  }
}

// Parse text format (your custom format)
function parseTextComponents(raw) {
  // Remove document heading
  const lines = raw.split('\n');
  let startIdx = 0;
  while (startIdx < lines.length && !/^[0-9]+\. /.test(lines[startIdx])) startIdx++;
  const text = lines.slice(startIdx).join('\n');

  // Split by component start
  const parts = text.split(/(?=^[0-9]+\. )/gm).filter(Boolean);
  const components = [];

  for (const part of parts) {
    const obj = {};
    const lines = part.split('\n');
    let i = 0;
    let params = [];
    let inParameters = false;
    let paramLines = [];

    while (i < lines.length) {
      let line = lines[i];
      let trimmed = line.trim();

      // Handle component title
      if (/^[0-9]+\. /.test(trimmed)) {
        obj.title = trimmed.replace(/^[0-9]+\. /, '');
        i++;
        continue;
      }

      // Detect start of parameters block
      if (trimmed.toLowerCase() === 'parameters:') {
        inParameters = true;
        paramLines = [];
        i++;
        continue;
      }

      // Collect parameter lines (YAML block)
      if (inParameters) {
        // End of parameters block: next top-level key or end of part
        if (/^[a-zA-Z0-9_]+:/.test(trimmed) && !/^\s/.test(line)) {
          inParameters = false;
          // Parse collected param lines as YAML
          try {
            params = yaml.load(paramLines.join('\n')) || [];
            if (!Array.isArray(params)) params = [params];
          } catch {
            params = [];
          }
          continue; // Don't process this line as a parameter
        } else {
          paramLines.push(line);
          i++;
          // If last line, parse
          if (i === lines.length) {
            try {
              params = yaml.load(paramLines.join('\n')) || [];
              if (!Array.isArray(params)) params = [params];
            } catch {
              params = [];
            }
          }
          continue;
        }
      }

      // Handle content block
      if (trimmed.startsWith('content: |')) {
        i++;
        let contentLines = [];
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
          contentLines.push(lines[i].replace(/^  /, ''));
          i++;
        }
        obj.content = contentLines.join('\n').trim();
        continue;
      }

      // Handle other key-value pairs
      const match = trimmed.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (match) {
        let key = match[1];
        let value = match[2];
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (key === 'version') key = 'component_version';
        if (key === 'tags' || key === 'tested_versions' || key === 'default' || key === 'options') {
          try { value = JSON.parse(value.replace(/'/g, '"')); } catch {}
        }
        obj[key] = value;
      }
      i++;
    }

    // Normalize the object
    const normalized = normalizeFieldNames(obj);
    normalized.parameters = normalizeParameters(params);

    // Only require description and content (category is now removed)
    if ((normalized.component_id || normalized.title || normalized.name) && 
        normalized.description && 
        normalized.content) {
      components.push(normalized);
    }
  }
  return components;
}

export function parseComponentFile(content, type) {
  const cleaned = cleanInput(content);
  let components = [];

  // Try JSON or YAML if type is specified
  if (type === 'json' || type === 'yml' || type === 'yaml') {
    try {
      let parsed = parseJSONorYAML(cleaned);
      if (!Array.isArray(parsed)) parsed = [parsed];
      components = parsed.map(obj => {
        const normalized = normalizeFieldNames(obj);
        if (normalized.parameters && !Array.isArray(normalized.parameters)) {
          if (typeof normalized.parameters === 'object') {
            normalized.parameters = Object.values(normalized.parameters);
          } else {
            normalized.parameters = [];
          }
        }
        normalized.parameters = normalizeParameters(normalized.parameters);
        if (normalized.parameters && normalized.parameters.length > 0) {
          console.log('Parsed parameters:', normalized.parameters);
        }
        return normalized;
      });
    } catch {
      // Fallback to text parsing
      components = parseTextComponents(cleaned);
    }
  } else {
    // Try all formats
    try {
      let parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) parsed = [parsed];
      components = parsed.map(obj => {
        const normalized = normalizeFieldNames(obj);
        if (normalized.parameters && !Array.isArray(normalized.parameters)) {
          if (typeof normalized.parameters === 'object') {
            normalized.parameters = Object.values(normalized.parameters);
          } else {
            normalized.parameters = [];
          }
        }
        normalized.parameters = normalizeParameters(normalized.parameters);
        if (normalized.parameters && normalized.parameters.length > 0) {
          console.log('Parsed parameters:', normalized.parameters);
        }
        return normalized;
      });
    } catch {
      try {
        let parsed = yaml.load(cleaned);
        if (!Array.isArray(parsed)) parsed = [parsed];
        components = parsed.map(obj => {
          const normalized = normalizeFieldNames(obj);
          if (normalized.parameters && !Array.isArray(normalized.parameters)) {
            if (typeof normalized.parameters === 'object') {
              normalized.parameters = Object.values(normalized.parameters);
            } else {
              normalized.parameters = [];
            }
          }
          normalized.parameters = normalizeParameters(normalized.parameters);
          if (normalized.parameters && normalized.parameters.length > 0) {
            console.log('Parsed parameters:', normalized.parameters);
          }
          return normalized;
        });
      } catch {
        // Fallback to text parsing
        components = parseTextComponents(cleaned);
      }
    }
  }

  // Remove array wrapping if only one component
  return components.length === 1 ? components[0] : components;
} 