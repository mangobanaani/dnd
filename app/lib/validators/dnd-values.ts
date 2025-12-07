/**
 * D&D Value Validators
 * Validation functions for D&D 5e numeric values
 */

export type ValidationResult =
  | { valid: true; value: number }
  | { valid: false; error: string };

/**
 * Validate D&D 5e Difficulty Class (DC)
 * Valid range: 1-30
 *
 * @param value - String or number to validate
 * @returns ValidationResult with parsed value or error
 *
 * @example
 * ```typescript
 * const result = validateDC('15');
 * if (result.valid) {
 *   console.log(result.value); // 15
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateDC(value: string | number): ValidationResult {
  // Handle special number values
  if (typeof value === 'number') {
    if (isNaN(value)) {
      return {
        valid: false,
        error: 'Value must be a valid number',
      };
    }

    if (!isFinite(value)) {
      return {
        valid: false,
        error: 'Value must be a finite number',
      };
    }
  }

  // Convert to number
  const num = typeof value === 'string' ? Number(value) : value;

  // Check if conversion resulted in NaN
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Value must be a valid number',
    };
  }

  // Check if it's an integer
  if (!Number.isInteger(num)) {
    return {
      valid: false,
      error: 'Value must be an integer',
    };
  }

  // Check range (1-30)
  if (num < 1 || num > 30) {
    return {
      valid: false,
      error: 'DC must be between 1 and 30',
    };
  }

  return { valid: true, value: num };
}

/**
 * Validate number of rounds (combat duration)
 * Must be a positive integer
 *
 * @param value - String or number to validate
 * @returns ValidationResult with parsed value or error
 *
 * @example
 * ```typescript
 * const result = validateRounds('10');
 * if (result.valid) {
 *   console.log(result.value); // 10
 * }
 * ```
 */
export function validateRounds(value: string | number): ValidationResult {
  const result = validatePositiveInteger(value);

  if (!result.valid) {
    return {
      valid: false,
      error: result.error.replace('positive integer', 'positive number of rounds'),
    };
  }

  return result;
}

/**
 * Validate positive integer
 * Must be > 0 and an integer
 *
 * @param value - String or number to validate
 * @returns ValidationResult with parsed value or error
 *
 * @example
 * ```typescript
 * const result = validatePositiveInteger('42');
 * if (result.valid) {
 *   console.log(result.value); // 42
 * }
 * ```
 */
export function validatePositiveInteger(value: string | number): ValidationResult {
  // Handle special number values
  if (typeof value === 'number') {
    if (isNaN(value)) {
      return {
        valid: false,
        error: 'Value must be a valid number',
      };
    }

    if (!isFinite(value)) {
      return {
        valid: false,
        error: 'Value must be a finite number',
      };
    }
  }

  // Convert to number
  const num = typeof value === 'string' ? Number(value) : value;

  // Check if conversion resulted in NaN
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Value must be a valid number',
    };
  }

  // Check if it's an integer
  if (!Number.isInteger(num)) {
    return {
      valid: false,
      error: 'Value must be an integer',
    };
  }

  // Check if positive (> 0)
  if (num <= 0) {
    return {
      valid: false,
      error: 'Value must be a positive integer',
    };
  }

  return { valid: true, value: num };
}
