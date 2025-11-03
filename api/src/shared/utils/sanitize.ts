/**
 * Sanitization utilities to remove sensitive data before storing in database
 */

/**
 * Removes sensitive fields (like API keys) from AI config before saving to database.
 * The API key should only be stored in the encrypted ai_api_key column, not in the JSON ai_config field.
 *
 * @param config - The AI configuration object that may contain sensitive data
 * @returns A sanitized copy without sensitive fields, or undefined if no config provided
 */
export function sanitizeAiConfig(config: any): any | undefined {
  if (!config) return undefined;

  // Destructure to remove sensitive fields
  const { apiKey, ...safeConfig } = config;

  return safeConfig;
}
