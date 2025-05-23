// Utility for extracting parameters from user messages

export function extractParameters(message) {
  const parameters = {};

  // Extract symbol
  const symbolMatch = message.match(/symbol\s*[:=]\s*([A-Za-z0-9]+)/i);
  if (symbolMatch) {
    parameters.symbol = symbolMatch[1];
  }

  // Extract EMA
  const emaMatch = message.match(/EMA\s*[:=]\s*(\d+)/i);
  if (emaMatch) {
    parameters.ema = parseInt(emaMatch[1], 10);
  }

  // Extract RSI
  const rsiMatch = message.match(/RSI\s*[:=]\s*(\d+)/i);
  if (rsiMatch) {
    parameters.rsi = parseInt(rsiMatch[1], 10);
  }

  // Extract risk
  const riskMatch = message.match(/risk\s*[:=]\s*(\d+(?:\.\d+)?)/i);
  if (riskMatch) {
    parameters.risk = parseFloat(riskMatch[1]);
  }

  // Extract session
  const sessionMatch = message.match(/session\s*[:=]\s*([A-Za-z0-9]+)/i);
  if (sessionMatch) {
    parameters.session = sessionMatch[1];
  }

  return parameters;
} 