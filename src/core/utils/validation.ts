import { Product } from '../types';
import { ValidationError } from '../errors';

export function validateProduct(product: Product): void {
  throw new ValidationError('failed', null, "failed to validate the product")
}
