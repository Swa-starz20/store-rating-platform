const { z } = require('zod');
const { nameValidation, emailValidation, passwordValidation, addressValidation } = require('./auth.validation');

// Store creation schema (supports linking existing owner or auto-creating owner)
const createStoreSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  address: addressValidation,
  // Either existing ownerId OR new owner details
  ownerId: z.string().uuid('Invalid owner ID format').optional(),
  owner: z
    .object({
      name: nameValidation,
      email: emailValidation,
      password: passwordValidation,
      address: addressValidation
    })
    .optional()
}).refine((data) => data.ownerId || data.owner, {
  message: 'Must either provide an existing ownerId or new owner details',
  path: ['ownerId']
});

const listStoresQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional().default(''),
  name: z.string().optional(),
  address: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'rating', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createStoreSchema,
  listStoresQuerySchema
};
