import { describe, test, expect } from 'vitest';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';

describe('registration validation', () => {
  test('rejects names shorter than 20 characters', () => {
    expect(validateName('Too Short')).toMatch(/between 20 and 60/);
  });

  test('rejects names longer than 60 characters', () => {
    expect(validateName('A'.repeat(61))).toMatch(/between 20 and 60/);
  });

  test('accepts a name within range', () => {
    expect(validateName('Elizabeth Margaret Cunningham')).toBeNull();
  });

  test('rejects malformed emails', () => {
    expect(validateEmail('not-an-email')).toMatch(/valid email/);
  });

  test('accepts a well-formed email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  test('rejects an address longer than 400 characters', () => {
    expect(validateAddress('A'.repeat(401))).toMatch(/400 characters/);
  });

  test('rejects a password shorter than 8 characters', () => {
    expect(validatePassword('Ab1!')).toMatch(/between 8 and 16/);
  });

  test('rejects a password missing an uppercase letter', () => {
    expect(validatePassword('lowercase1!')).toMatch(/uppercase/);
  });

  test('rejects a password missing a special character', () => {
    expect(validatePassword('NoSpecial1')).toMatch(/special character/);
  });

  test('accepts a valid strong password', () => {
    expect(validatePassword('StrongPass1!')).toBeNull();
  });
});
