const { z } = require('zod');
const { VALIDATION_RULES, ROLES } = require('../config/constants');

const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
  .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, `Password cannot exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`)
  .regex(
    VALIDATION_RULES.PASSWORD_REGEX,
    'Password must be 8-16 characters and contain at least one uppercase letter (A-Z) and one special character (!@#$%^&*(),.?":{}|<>)'
  );

const nameValidation = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`)
  .max(VALIDATION_RULES.NAME_MAX_LENGTH, `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`);

const addressValidation = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, 'Address is required')
  .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH, `Address cannot exceed ${VALIDATION_RULES.ADDRESS_MAX_LENGTH} characters`);

const emailValidation = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Invalid email address format')
  .max(255, 'Email cannot exceed 255 characters');

// Public User Registration schema
const registerSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  address: addressValidation
});

// Single Login schema
const loginSchema = z.object({
  email: emailValidation,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

// Change Password schema (for authenticated User / Store Owner)
const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
  newPassword: passwordValidation
});

module.exports = {
  nameValidation,
  addressValidation,
  emailValidation,
  passwordValidation,
  registerSchema,
  loginSchema,
  changePasswordSchema
};
