/**
 * Retrieves a string environment variable.
 * @param key The name of the environment variable.
 * @param defaultValue Optional default value if the variable is not set.
 * @returns The value of the environment variable.
 * @throws Error if the variable is missing and no default value is provided.
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

/**
 * Retrieves a numeric environment variable.
 * @param key The name of the environment variable.
 * @param defaultValue Optional default value if the variable is not set.
 * @returns The numeric value of the environment variable.
 * @throws Error if the variable is missing, not a number, and no default is provided.
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a number`);
  }
  return num;
}
