import { z } from 'zod';

export const cartItemAddSchema = z.object({
  body: z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive().default(1),
  }),
});

export const cartItemUpdateSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    quantity: z.number().int().min(0),
  }),
});

export const cartItemDeleteSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
