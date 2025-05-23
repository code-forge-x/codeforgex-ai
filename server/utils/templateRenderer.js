// Utility for rendering templates with parameters

export function renderTemplate(template, parameters) {
  let renderedContent = template;

  // Replace placeholders with parameter values
  for (const [key, value] of Object.entries(parameters)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    renderedContent = renderedContent.replace(placeholder, value);
  }

  return renderedContent;
} 