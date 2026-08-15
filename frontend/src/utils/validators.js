// Mirrors backend/src/validators/common.js so users get instant feedback.
// The server remains the source of truth for every rule enforced here.

export function validateName(name) {
  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    return 'Name must be between 20 and 60 characters';
  }
  return null;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) {
    return 'A valid email is required';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || address.trim().length < 1 || address.length > 400) {
    return 'Address is required and must be at most 400 characters';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>[\]\\/~`_+=;'-]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}
