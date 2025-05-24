/**
 * Password validation and strength evaluation utilities
 */

// Password requirement definition
export interface PasswordRequirement {
  id: string;
  text: string;
  validator: (password: string) => boolean;
  valid: boolean;
}

// Password validation result
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  requirements: PasswordRequirement[];
}

// Password requirements
const PASSWORD_REQUIREMENTS: Omit<PasswordRequirement, "valid">[] = [
  {
    id: "length",
    text: "At least 8 characters long",
    validator: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    text: "Contains at least one uppercase letter",
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    text: "Contains at least one lowercase letter",
    validator: (password: string) => /[a-z]/.test(password),
  },
  {
    id: "number",
    text: "Contains at least one number",
    validator: (password: string) => /\d/.test(password),
  },
  {
    id: "special",
    text: "Contains at least one special character",
    validator: (password: string) =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  },
];

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  "password",
  "password123",
  "123456",
  "123456789",
  "qwerty",
  "admin",
  "welcome",
  "letmein",
  "abc123",
  "monkey",
  "1234567",
  "dragon",
  "baseball",
  "football",
  "master",
  "shadow",
  "qwertyuiop",
  "superman",
  "iloveyou",
  "hello123",
  "test123",
];

/**
 * Validates a password against security requirements
 *
 * @param password - The password to validate
 * @returns Validation result with requirements status
 */
export const validatePassword = (
  password: string
): PasswordValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required",
      requirements: PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        valid: false,
      })),
    };
  }

  // Check for common weak passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return {
      isValid: false,
      error: "This password is too common and easily guessable",
      requirements: PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        valid: req.validator(password),
      })),
    };
  }

  // Validate against all requirements
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    valid: req.validator(password),
  }));

  // Check if all requirements are met
  const allRequirementsMet = requirements.every((req) => req.valid);

  return {
    isValid: allRequirementsMet,
    error: allRequirementsMet
      ? undefined
      : "Password does not meet all requirements",
    requirements,
  };
};

/**
 * Calculates password strength on a scale of 0-100
 *
 * @param password - The password to evaluate
 * @returns Strength score (0-100)
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let score = 0;
  const length = password.length;

  // Length contribution (up to 30 points)
  score += Math.min(30, length * 2);

  // Character variety (up to 40 points)
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/\d/.test(password)) score += 10; // Numbers
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 10; // Special chars

  // Character distribution (up to 15 points)
  const hasGoodDistribution =
    /[A-Z].*[A-Z]/.test(password) || // At least 2 uppercase
    /\d.*\d/.test(password) || // At least 2 numbers
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      password
    ); // At least 2 special

  if (hasGoodDistribution) score += 15;

  // Penalize for common patterns (up to -30 points)
  if (/^[A-Za-z]+\d+$/.test(password)) score -= 10; // Simple word+number pattern
  if (/^[A-Za-z]+[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]$/.test(password))
    score -= 10; // Simple word+symbol pattern
  if (/12345|qwerty|asdfg|zxcvb/i.test(password)) score -= 10; // Common sequences

  // Check against common passwords (severe penalty)
  if (COMMON_PASSWORDS.includes(password.toLowerCase()))
    score = Math.min(score, 20);

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
};

/**
 * Generates a secure random password meeting all requirements
 *
 * @param length - The desired password length (minimum 8)
 * @returns A secure random password
 */
export const generateSecurePassword = (length = 12): string => {
  const actualLength = Math.max(8, length);

  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + special;

  // Ensure at least one of each character type
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  for (let i = 4; i < actualLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Checks if a password has been previously used
 * This is a stub - in a real implementation, this would call a backend API
 *
 * @param userId - User ID to check against
 * @param password - Password to check
 * @returns Promise resolving to true if password has been used before
 */
export const isPasswordPreviouslyUsed = async (
  userId: string,
  password: string
): Promise<boolean> => {
  // In a real implementation, this would make an API call to check password history
  // This is just a stub that always returns false
  return false;
};

/**
 * Checks if a password has been breached in known data breaches
 * This is a stub - in a real implementation, this would call a service like
 * the "Have I Been Pwned" API or similar
 *
 * @param password - Password to check
 * @returns Promise resolving to true if password has been found in breaches
 */
export const isPasswordBreached = async (
  password: string
): Promise<boolean> => {
  // In a real implementation, this would check against breach databases
  // This is just a stub that returns false
  return false;
};

export default {
  validatePassword,
  getPasswordStrength,
  generateSecurePassword,
  isPasswordPreviouslyUsed,
  isPasswordBreached,
};
