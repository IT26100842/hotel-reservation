/**
 * Shared Form Validation Utilities for Checkout & Registration
 */

/**
 * Validates that a full name is provided and contains NO numbers (digits).
 */
export function validateFullName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return 'Full name is required.';
  }
  if (/\d/.test(trimmed)) {
    return 'Full name cannot contain numbers.';
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/.test(trimmed)) {
    return 'Full name can only contain letters and spaces.';
  }
  return null;
}

/**
 * Validates an email address.
 */
export function validateEmail(email: string): string | null {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

/**
 * Validates a Sri Lankan or international phone number.
 * Accepted formats:
 * - Sri Lankan local: 07XXXXXXXX or 0XXXXXXXXX (10 digits starting with 0)
 * - Sri Lankan international: +947XXXXXXXX or +94 XX XXX XXXX
 * - International: +[country code][number] (9 to 15 digits)
 */
export function validatePhoneNumber(phone: string): string | null {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return 'Phone number is required.';
  }
  if (/[A-Za-z]/.test(trimmed)) {
    return 'Phone number cannot contain letters.';
  }
  // Remove spaces, hyphens, parentheses, dots
  const cleaned = trimmed.replace(/[\s\-().]/g, '');

  // Check valid characters (optional leading +, followed by digits)
  if (!/^\+?\d+$/.test(cleaned)) {
    return 'Please enter a valid phone number (e.g. 0771234567 or +94 77 123 4567).';
  }

  // Reject all-repeating digits like 0000000000 or 07777777777
  const digitsOnly = cleaned.replace(/^\+/, '');
  if (/^(\d)\1{8,}$/.test(digitsOnly)) {
    return 'Please enter a valid active phone number.';
  }

  // Sri Lankan local 10-digit format: 07XXXXXXXX or 011XXXXXXX etc.
  const isSriLankaLocal = /^0[1-9]\d{8}$/.test(cleaned);
  // Sri Lankan +94 format: +947XXXXXXXX (11 digits after +)
  const isSriLankaIntl = /^\+94[1-9]\d{8}$/.test(cleaned);
  // Sri Lankan 94 without +: 947XXXXXXXX
  const isSriLankaNoPlus = /^94[1-9]\d{8}$/.test(cleaned);
  // General international format: + followed by 9 to 15 digits
  const isGeneralIntl = /^\+[1-9]\d{8,14}$/.test(cleaned);

  if (!isSriLankaLocal && !isSriLankaIntl && !isSriLankaNoPlus && !isGeneralIntl) {
    return 'Enter a valid phone number (e.g. 0771234567 or +94 77 123 4567).';
  }

  return null;
}

/**
 * Validates a Sri Lankan NIC (Old 9 digits + V/X or New 12 digits) or Passport Number.
 */
export function validateNicOrPassport(value: string): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return 'NIC or Passport number is required.';
  }

  const cleaned = trimmed.replace(/[\s\-]/g, '');

  // Old Sri Lankan NIC: 9 digits followed by V or X (case-insensitive)
  const isOldNic = /^[0-9]{9}[vVxX]$/.test(cleaned);
  // New Sri Lankan NIC: 12 digits starting with 19 or 20
  const isNewNic = /^(19|20)[0-9]{10}$/.test(cleaned);
  // Passport: 1 or 2 letters followed by 6 to 9 digits (e.g. N1234567, AB1234567)
  const isPassport = /^[A-Za-z]{1,2}[0-9]{6,9}$/.test(cleaned);

  if (!isOldNic && !isNewNic && !isPassport) {
    return 'Enter a valid NIC (e.g. 200012345678 or 991234567V) or Passport (e.g. N1234567).';
  }

  return null;
}
