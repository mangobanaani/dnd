/**
 * D&D Value Validators Tests
 * Tests for D&D 5e numeric value validation
 */

import { validateDC, validateRounds, validatePositiveInteger } from '@/app/lib/validators/dnd-values';

describe('D&D Value Validators', () => {
  describe('validateDC', () => {
    it('should accept valid DC values (1-30)', () => {
      expect(validateDC('1')).toEqual({ valid: true, value: 1 });
      expect(validateDC('15')).toEqual({ valid: true, value: 15 });
      expect(validateDC('30')).toEqual({ valid: true, value: 30 });
    });

    it('should accept valid DC as number', () => {
      expect(validateDC(10)).toEqual({ valid: true, value: 10 });
      expect(validateDC(20)).toEqual({ valid: true, value: 20 });
    });

    it('should reject DC below 1', () => {
      const result = validateDC('0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('1');
        expect(result.error).toContain('30');
      }
    });

    it('should reject DC above 30', () => {
      const result = validateDC('31');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('30');
      }
    });

    it('should reject negative DC', () => {
      const result = validateDC('-5');
      expect(result.valid).toBe(false);
    });

    it('should reject non-numeric input', () => {
      const result = validateDC('abc');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('number');
      }
    });

    it('should reject empty string', () => {
      const result = validateDC('');
      expect(result.valid).toBe(false);
    });

    it('should reject decimal values', () => {
      const result = validateDC('15.5');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('integer');
      }
    });
  });

  describe('validateRounds', () => {
    it('should accept positive round values', () => {
      expect(validateRounds('1')).toEqual({ valid: true, value: 1 });
      expect(validateRounds('10')).toEqual({ valid: true, value: 10 });
      expect(validateRounds('100')).toEqual({ valid: true, value: 100 });
    });

    it('should accept large values for long durations', () => {
      expect(validateRounds('4800')).toEqual({ valid: true, value: 4800 }); // 8 hours in rounds
    });

    it('should reject zero rounds', () => {
      const result = validateRounds('0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('positive');
      }
    });

    it('should reject negative rounds', () => {
      const result = validateRounds('-1');
      expect(result.valid).toBe(false);
    });

    it('should reject non-numeric input', () => {
      const result = validateRounds('abc');
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validateRounds('');
      expect(result.valid).toBe(false);
    });

    it('should reject decimal values', () => {
      const result = validateRounds('5.5');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('integer');
      }
    });
  });

  describe('validatePositiveInteger', () => {
    it('should accept positive integers', () => {
      expect(validatePositiveInteger('1')).toEqual({ valid: true, value: 1 });
      expect(validatePositiveInteger('42')).toEqual({ valid: true, value: 42 });
      expect(validatePositiveInteger('1000')).toEqual({ valid: true, value: 1000 });
    });

    it('should accept positive integers as number', () => {
      expect(validatePositiveInteger(5)).toEqual({ valid: true, value: 5 });
    });

    it('should reject zero', () => {
      const result = validatePositiveInteger('0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('positive');
      }
    });

    it('should reject negative numbers', () => {
      const result = validatePositiveInteger('-10');
      expect(result.valid).toBe(false);
    });

    it('should reject non-numeric input', () => {
      const result = validatePositiveInteger('not a number');
      expect(result.valid).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validatePositiveInteger('');
      expect(result.valid).toBe(false);
    });

    it('should reject decimal values', () => {
      const result = validatePositiveInteger('3.14');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('integer');
      }
    });

    it('should reject NaN', () => {
      const result = validatePositiveInteger(NaN);
      expect(result.valid).toBe(false);
    });

    it('should reject Infinity', () => {
      const result = validatePositiveInteger(Infinity);
      expect(result.valid).toBe(false);
    });
  });
});
