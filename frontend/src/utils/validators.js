// Client-side validation utilities matching backend constraints

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 20,
  NAME_MAX_LENGTH: 60,
  ADDRESS_MAX_LENGTH: 400,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 16,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  RATING_MIN: 1,
  RATING_MAX: 5
};

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Name is required.';
  }
  const len = name.trim().length;
  if (len < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long (currently ${len}).`;
  }
  if (len > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters (currently ${len}).`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (password.length > VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
    return `Password cannot exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return 'Address is required.';
  }
  if (address.trim().length > VALIDATION_RULES.ADDRESS_MAX_LENGTH) {
    return `Address cannot exceed ${VALIDATION_RULES.ADDRESS_MAX_LENGTH} characters.`;
  }
  return null;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < VALIDATION_RULES.RATING_MIN || num > VALIDATION_RULES.RATING_MAX) {
    return `Rating must be an integer between ${VALIDATION_RULES.RATING_MIN} and ${VALIDATION_RULES.RATING_MAX}.`;
  }
  return null;
};
