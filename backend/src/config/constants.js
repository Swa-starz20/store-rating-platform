// Application constants and validation constraints

const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  STORE_OWNER: 'STORE_OWNER'
};

const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 20,
  NAME_MAX_LENGTH: 60,
  ADDRESS_MAX_LENGTH: 400,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 16,
  // At least one uppercase letter (A-Z) and at least one special character
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/,
  RATING_MIN: 1,
  RATING_MAX: 5
};

module.exports = {
  ROLES,
  VALIDATION_RULES
};
