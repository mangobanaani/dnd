export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateHp(hp: number): void {
  if (isNaN(hp)) {
    throw new ValidationError('HP must be a valid number');
  }
  if (!Number.isInteger(hp)) {
    throw new ValidationError('HP must be a whole number');
  }
  if (hp < 1 || hp > 999) {
    throw new ValidationError('HP must be between 1 and 999');
  }
}

export function validateAc(ac: number): void {
  if (isNaN(ac)) {
    throw new ValidationError('AC must be a valid number');
  }
  if (!Number.isInteger(ac)) {
    throw new ValidationError('AC must be a whole number');
  }
  if (ac < 0 || ac > 30) {
    throw new ValidationError('AC must be between 0 and 30');
  }
}

export function validateInitiativeModifier(modifier: number): void {
  if (isNaN(modifier)) {
    throw new ValidationError('Initiative modifier must be a valid number');
  }
  if (!Number.isInteger(modifier)) {
    throw new ValidationError('Initiative modifier must be a whole number');
  }
  if (modifier < -10 || modifier > 20) {
    throw new ValidationError('Initiative modifier must be between -10 and 20');
  }
}

export interface CombatantInput {
  hp: number;
  ac: number;
  initiativeModifier: number;
}

export function validateCombatantInput(input: CombatantInput): CombatantInput {
  validateHp(input.hp);
  validateAc(input.ac);
  validateInitiativeModifier(input.initiativeModifier);

  return {
    hp: input.hp,
    ac: input.ac,
    initiativeModifier: input.initiativeModifier,
  };
}
