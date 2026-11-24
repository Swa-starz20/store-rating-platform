const { z } = require('zod');
const { ROLES } = require('../config/constants');
const { nameValidation, emailValidation, passwordValidation, addressValidation } = require('./auth.validation');

const createUserByAdminSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  address: addressValidation,
  role: z.nativeEnum(ROLES, {
    errorMap: () => ({ message: `Role must be one of: ${Object.values(ROLES).join(', ')}` })
  })
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional().default(''),
  role: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createUserByAdminSchema,
  listUsersQuerySchema
};
