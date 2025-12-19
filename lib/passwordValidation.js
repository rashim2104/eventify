/**
 * Password strength validation utility
 * Provides validation for password strength requirements
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  preventCommonPatterns: true,
};

/**
 * Common weak passwords and patterns to avoid
 */
const COMMON_PASSWORDS = [
  'password',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'welcome',
  'welcome123',
  'admin',
  'admin123',
  'user',
  'user123',
  'login',
  'login123',
  'pass',
  'pass123',
  'test',
  'test123',
];

/**
 * Common patterns that make passwords weak
 */
const WEAK_PATTERNS = [
  /^(.)\1+$/, // All same characters
  /^123456/, // Sequential numbers
  /^qwerty/i, // Keyboard patterns
  /^abc/i, // Sequential letters
  /^password/i, // Contains "password"
];

/**
 * Validates password strength according to security requirements
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with isValid boolean and error messages
 */
export function validatePasswordStrength(password) {
  const errors = [];

  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    );
  }

  // Check maximum length
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(
      `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`
    );
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (
    PASSWORD_REQUIREMENTS.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  if (PASSWORD_REQUIREMENTS.preventCommonPatterns) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      errors.push('Password is too common and easily guessable');
    }

    // Check for weak patterns
    for (const pattern of WEAK_PATTERNS) {
      if (pattern.test(password)) {
        errors.push(
          'Password contains weak patterns (repeating characters, sequential numbers, etc.)'
        );
        break;
      }
    }

    // Note: Passwords of 8+ characters are acceptable
    // For better security, consider using 12+ characters
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    score: calculatePasswordScore(password),
  };
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - The password to score
 * @returns {number} Password strength score
 */
export function calculatePasswordScore(password) {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  // Bonus for longer passwords with mixed characters
  if (
    password.length >= 12 &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  ) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Get password strength level based on score
 * @param {number} score - Password score (0-100)
 * @returns {string} Strength level
 */
export function getPasswordStrengthLevel(score) {
  if (score < 30) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 70) return 'Fair';
  if (score < 90) return 'Good';
  return 'Strong';
}

/**
 * Generate a secure password suggestion
 * @returns {string} Secure password suggestion
 */
export function generateSecurePassword() {
  const adjectives = [
    'Swift',
    'Bright',
    'Clever',
    'Bold',
    'Quick',
    'Wise',
    'Sharp',
    'Brave',
  ];
  const nouns = [
    'Tiger',
    'Eagle',
    'Ocean',
    'Mountain',
    'Forest',
    'River',
    'Storm',
    'Flame',
  ];
  const numbers = Math.floor(Math.random() * 999) + 1;
  const symbols = '!@#$%^&*';

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  return `${adjective}${noun}${numbers}${symbol}`;
}
