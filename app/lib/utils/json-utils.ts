/**
 * JSON Utilities
 * Safe JSON parsing with error handling
 */

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; defaultValue?: T };

/**
 * Safely parse JSON string with error handling
 *
 * @param jsonString - The JSON string to parse
 * @param defaultValue - Optional default value to return on failure
 * @returns ParseResult with success/failure status
 *
 * @example
 * ```typescript
 * const result = safeParseJSON<User>(userJson);
 * if (result.success) {
 *   console.log(result.data.name);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function safeParseJSON<T = unknown>(
  jsonString: string,
  defaultValue?: T
): ParseResult<T> {
  try {
    const data = JSON.parse(jsonString) as T;
    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to parse JSON: Unknown error';

    return {
      success: false,
      error: errorMessage,
      ...(defaultValue !== undefined && { defaultValue }),
    };
  }
}

/**
 * Safely parse JSON from localStorage
 *
 * @param key - localStorage key
 * @param defaultValue - Default value if key doesn't exist or parse fails
 * @returns Parsed data or default value
 *
 * @example
 * ```typescript
 * const campaigns = safeParseLocalStorage<Campaign[]>('dnd-campaigns', []);
 * ```
 */
export function safeParseLocalStorage<T>(
  key: string,
  defaultValue: T
): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = localStorage.getItem(key);
  if (!item) {
    return defaultValue;
  }

  const result = safeParseJSON<T>(item, defaultValue);
  return result.success ? result.data : result.defaultValue!;
}

/**
 * Safely parse JSON from sessionStorage
 *
 * @param key - sessionStorage key
 * @param defaultValue - Default value if key doesn't exist or parse fails
 * @returns Parsed data or default value
 */
export function safeParseSessionStorage<T>(
  key: string,
  defaultValue: T
): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = sessionStorage.getItem(key);
  if (!item) {
    return defaultValue;
  }

  const result = safeParseJSON<T>(item, defaultValue);
  return result.success ? result.data : result.defaultValue!;
}
