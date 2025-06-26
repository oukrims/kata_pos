import { z } from 'zod';

// base schemas
const idSchema = z.string().min(1, 'ID cannot be empty');
const positiveNumberSchema = z.number().positive('Must be a positive number');
const nonNegativeNumberSchema = z.number().min(0, 'Cannot be negative');
const percentageSchema = z.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100%');

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name cannot be empty').trim(),
  price: nonNegativeNumberSchema,
  isWeighted: z.boolean(),
  category: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  upc: z.string().optional()
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name cannot be empty').trim(),
  price: nonNegativeNumberSchema,
  isWeighted: z.boolean(),
  category: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  upc: z.string().optional(),
  createdAt: z.date()
});

export const updateProductSchema = createProductSchema.partial();

export const createMarkdownSchema = z.object({
  productId: idSchema,
  discountAmount: nonNegativeNumberSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  reason: z.string().optional(),
  priority: z.number().int().optional()
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

export const markdownSchema = z.object({
  productId: idSchema,
  discountAmount: nonNegativeNumberSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  reason: z.string().optional(),
  priority: z.number().int().optional(),
  createdAt: z.date()
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

// buy N Get M off special
export const createBuyNGetMOffSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('buyNgetMoff'),
  buyQuantity: z.number().int().positive('Buy quantity must be a positive integer'),
  getQuantity: z.number().int().positive('Get quantity must be a positive integer'),
  discountPercent: percentageSchema
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

export const buyNGetMOffSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('buyNgetMoff'),
  buyQuantity: z.number().int().positive('Buy quantity must be a positive integer'),
  getQuantity: z.number().int().positive('Get quantity must be a positive integer'),
  discountPercent: percentageSchema,
  createdAt: z.date()
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

// N for X special
export const createNForXSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('nForX'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  price: nonNegativeNumberSchema
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

export const nForXSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('nForX'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  price: nonNegativeNumberSchema,
  createdAt: z.date()
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

// weighted special
export const createWeightedSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('weighted'),
  buyWeight: positiveNumberSchema,
  getWeight: positiveNumberSchema,
  discountPercent: percentageSchema
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

export const weightedSchema = z.object({
  productId: idSchema,
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean().default(true),
  maxApplications: z.number().int().positive().optional(),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  stackable: z.boolean().optional(),
  type: z.literal('weighted'),
  buyWeight: positiveNumberSchema,
  getWeight: positiveNumberSchema,
  discountPercent: percentageSchema,
  createdAt: z.date()
}).refine(
  (data) => data.validFrom < data.validTo,
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"]
  }
);

export const createPromotionSchema = z.union([
  createBuyNGetMOffSchema,
  createNForXSchema,
  createWeightedSchema
]);

export const promotionSchema = z.union([
  buyNGetMOffSchema,
  nForXSchema,
  weightedSchema
]);

export type ProductInput = z.infer<typeof createProductSchema>;
export type MarkdownInput = z.infer<typeof createMarkdownSchema>;
export type PromotionInput = z.infer<typeof createPromotionSchema>;
