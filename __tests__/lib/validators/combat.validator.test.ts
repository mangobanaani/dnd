import {
  validateCombatantInput,
  validateHp,
  validateAc,
  validateInitiativeModifier,
  ValidationError,
} from '@/app/lib/validators/combat.validator';

describe('Combat Validators', () => {
  describe('validateHp', () => {
    it('should accept valid HP values', () => {
      expect(() => validateHp(1)).not.toThrow();
      expect(() => validateHp(100)).not.toThrow();
      expect(() => validateHp(999)).not.toThrow();
    });

    it('should reject HP less than 1', () => {
      expect(() => validateHp(0)).toThrow(ValidationError);
      expect(() => validateHp(-5)).toThrow(ValidationError);
      expect(() => validateHp(0)).toThrow('HP must be between 1 and 999');
    });

    it('should reject HP greater than 999', () => {
      expect(() => validateHp(1000)).toThrow(ValidationError);
      expect(() => validateHp(9999)).toThrow(ValidationError);
      expect(() => validateHp(1000)).toThrow('HP must be between 1 and 999');
    });

    it('should reject non-integer HP values', () => {
      expect(() => validateHp(10.5)).toThrow(ValidationError);
      expect(() => validateHp(10.5)).toThrow('HP must be a whole number');
    });

    it('should reject NaN', () => {
      expect(() => validateHp(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateAc', () => {
    it('should accept valid AC values', () => {
      expect(() => validateAc(0)).not.toThrow();
      expect(() => validateAc(15)).not.toThrow();
      expect(() => validateAc(30)).not.toThrow();
    });

    it('should reject AC less than 0', () => {
      expect(() => validateAc(-1)).toThrow(ValidationError);
      expect(() => validateAc(-10)).toThrow(ValidationError);
      expect(() => validateAc(-1)).toThrow('AC must be between 0 and 30');
    });

    it('should reject AC greater than 30', () => {
      expect(() => validateAc(31)).toThrow(ValidationError);
      expect(() => validateAc(100)).toThrow(ValidationError);
      expect(() => validateAc(31)).toThrow('AC must be between 0 and 30');
    });

    it('should reject non-integer AC values', () => {
      expect(() => validateAc(15.5)).toThrow(ValidationError);
      expect(() => validateAc(15.5)).toThrow('AC must be a whole number');
    });

    it('should reject NaN', () => {
      expect(() => validateAc(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateInitiativeModifier', () => {
    it('should accept valid initiative modifier values', () => {
      expect(() => validateInitiativeModifier(-10)).not.toThrow();
      expect(() => validateInitiativeModifier(0)).not.toThrow();
      expect(() => validateInitiativeModifier(10)).not.toThrow();
      expect(() => validateInitiativeModifier(20)).not.toThrow();
    });

    it('should reject initiative modifier less than -10', () => {
      expect(() => validateInitiativeModifier(-11)).toThrow(ValidationError);
      expect(() => validateInitiativeModifier(-100)).toThrow(ValidationError);
      expect(() => validateInitiativeModifier(-11)).toThrow('Initiative modifier must be between -10 and 20');
    });

    it('should reject initiative modifier greater than 20', () => {
      expect(() => validateInitiativeModifier(21)).toThrow(ValidationError);
      expect(() => validateInitiativeModifier(100)).toThrow(ValidationError);
      expect(() => validateInitiativeModifier(21)).toThrow('Initiative modifier must be between -10 and 20');
    });

    it('should reject non-integer initiative modifier values', () => {
      expect(() => validateInitiativeModifier(5.5)).toThrow(ValidationError);
      expect(() => validateInitiativeModifier(5.5)).toThrow('Initiative modifier must be a whole number');
    });

    it('should reject NaN', () => {
      expect(() => validateInitiativeModifier(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateCombatantInput', () => {
    it('should accept valid combatant input', () => {
      expect(() => validateCombatantInput({
        hp: 50,
        ac: 15,
        initiativeModifier: 3,
      })).not.toThrow();
    });

    it('should reject invalid HP', () => {
      expect(() => validateCombatantInput({
        hp: 0,
        ac: 15,
        initiativeModifier: 3,
      })).toThrow(ValidationError);
    });

    it('should reject invalid AC', () => {
      expect(() => validateCombatantInput({
        hp: 50,
        ac: 50,
        initiativeModifier: 3,
      })).toThrow(ValidationError);
    });

    it('should reject invalid initiative modifier', () => {
      expect(() => validateCombatantInput({
        hp: 50,
        ac: 15,
        initiativeModifier: 100,
      })).toThrow(ValidationError);
    });

    it('should return validated values', () => {
      const result = validateCombatantInput({
        hp: 50,
        ac: 15,
        initiativeModifier: 3,
      });

      expect(result).toEqual({
        hp: 50,
        ac: 15,
        initiativeModifier: 3,
      });
    });
  });
});
