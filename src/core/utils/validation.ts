import { Product } from '../types';
import { ValidationError } from '../errors';

export function validateProduct(product: Omit<Product, 'id'>): void {
  if (!product.name || product.name.trim().length === 0) {
    throw new ValidationError('name', product.name, 'product name cannot be empty');
  }
  if (product.price < 0) {
    throw new ValidationError('price', product.price, 'price cannot be negative');
  }
  if (typeof product.isWeighted !== 'boolean') {
    throw new ValidationError('isWeighted', product.isWeighted, 'isWeighted must be boolean');
  }
}
