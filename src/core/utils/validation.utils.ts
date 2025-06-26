import { Product, Markdown, Promotion } from '../types';
import { ValidationError } from '../errors';
import {
  createProductSchema,
  createMarkdownSchema,
  createPromotionSchema,
} from './validationSchema';
import { z } from 'zod';

function convertZodError(error: z.ZodError): ValidationError {
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return new ValidationError('unknown', undefined, 'Validation Failed')
  }
  const field = firstIssue.path.join('.');
  const value = firstIssue.message;
  const constraint = firstIssue.code;

  return new ValidationError(field, value, constraint);
}

export function validateProduct(product: Omit<Product, 'id'>): void {
  try {
    createProductSchema.parse(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function validateMarkdown(markdown: Omit<Markdown, 'id'>): void {
  try {
    createMarkdownSchema.parse(markdown);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function validatePromotion(promotion: Omit<Promotion, 'id'>): void {
  try {
    createPromotionSchema.parse(promotion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function parseProduct(data: unknown): Omit<Product, 'id' | 'createdAt'> {
  try {
    return createProductSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function parseMarkdown(data: unknown): Omit<Markdown, 'id' | 'createdAt'> {
  try {
    return createMarkdownSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function parsePromotion(data: unknown): Omit<Promotion, 'id' | 'createdAt'> {
  try {
    return createPromotionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function validateProductUpdate(updates: Partial<Product>): void {
  try {
    const { id, createdAt, ...updateData } = updates as any;
    createProductSchema.partial().parse(updateData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw convertZodError(error);
    }
    throw error;
  }
}

export function validateId(id: string, fieldName: string = 'id'): void {
  if (!id || id.trim().length === 0) {
    throw new ValidationError(fieldName, id, 'ID cannot be empty');
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (value <= 0) {
    throw new ValidationError(fieldName, value, 'Must be a positive number');
  }
}

export function validateNonNegativeNumber(value: number, fieldName: string): void {
  if (value < 0) {
    throw new ValidationError(fieldName, value, 'Cannot be negative');
  }
}

export function validatePercentage(value: number, fieldName: string): void {
  if (value < 0 || value > 100) {
    throw new ValidationError(fieldName, value, 'Must be between 0 and 100');
  }
}

export function validateDateRange(from: Date, to: Date): void {
  if (from >= to) {
    throw new ValidationError('validTo', to, 'Valid to date must be after valid from date');
  }
}
