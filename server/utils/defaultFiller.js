// Utility for filling default parameters

export function fillDefaults(parameters, defaults) {
  const filledParameters = { ...parameters };

  // Fill missing parameters with defaults
  for (const [key, value] of Object.entries(defaults)) {
    if (filledParameters[key] === undefined) {
      filledParameters[key] = value;
    }
  }

  return filledParameters;
} 