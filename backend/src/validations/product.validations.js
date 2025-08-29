import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const productListQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
    description: z.string().min(10).optional(),
    priceCents: z.number().int().positive(),
    currency: z.string().length(3).default('INR'),
    sku: z.string().min(3).max(100),
    status: z.nativeEnum(ProductStatus).default('DRAFT'),
    categoryId: z.string().cuid(),
    inventory: z.object({
      quantity: z.number().int().min(0).default(0),
      lowStock: z.number().int().min(0).default(2),
    }).optional(),
  }),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid().or(z.string().min(3).max(255)),
  }),
});

export const productImageSchema = z.object({
  s3Key: z.string().min(3),
  url: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().default(0),
});
