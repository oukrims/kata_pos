import { z } from 'zod';
import { Product } from '../types';
import { ValidationError } from '../errors';

const productSchema = z.object({
  name: z.string().trim().min(1, 'product name cannot be empty'),
  price: z.number().min(0, 'price cannot be negative'),
  isWeighted: z.boolean({ invalid_type_error: 'isWeighted must be boolean' })
});

export function validateProduct(product: Omit<Product, 'id'>): void {
  const result = productSchema.safeParse(product);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path[0]?.toString() || 'unknown';
    const value = (product as any)[field];
    const message = issue.message;

    throw new ValidationError(field, value, message);
  }
}
