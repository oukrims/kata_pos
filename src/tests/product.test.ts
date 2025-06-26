 import { describe, it, expect, beforeEach } from 'vitest';
import { ProductService } from '../../src/services/product.service';
import { ValidationError } from '../../src/core/errors';
import {
  EmptyNameProductFixture,
  NegativePriceProductFixture,
  ProductFixture,
  ProductVariantFixture,
  ProductVariant2Fixture
} from "./fixtures/product.fixture"
import { generateId } from '../core/utils';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
  });

  describe('addProduct', () => {
    it('should create product with valid data', () => {
      const product = service.addProduct(ProductFixture);

      expect(product.id).toBeDefined();
      expect(product.name).toBe(ProductFixture.name);
      expect(product.price).toBe(ProductFixture.price);
      expect(product.isWeighted).toBe(ProductFixture.isWeighted);
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => service.addProduct(EmptyNameProductFixture)).toThrow(ValidationError);
    });

    it('should throw ValidationError for negative price', () => {
      expect(() => service.addProduct(NegativePriceProductFixture)).toThrow(ValidationError);
    });

    it('should generate unique IDs', () => {
      const product1 = service.addProduct(ProductFixture);
      const product2 = service.addProduct(ProductVariantFixture);

      expect(product1.id).not.toBe(product2.id);
    });
  });

  describe('getProduct', () => {
    it('should return product if exists', () => {
      const created = service.addProduct(ProductFixture);
      const found = service.getProduct(created.id);

      expect(found).toEqual(created);
    });

    it('should return null if not found', () => {
      const found = service.getProduct('testproduct');
      expect(found).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update existing product', () => {
      const created = service.addProduct(ProductFixture);

      const updated = service.updateProduct(created.id, { price: 2.49 });

      expect(updated?.price).toBe(2.49);
      expect(updated?.name).toBe(ProductFixture.name);
      expect(updated?.id).toBe(created.id);
    });

    it('should return null for non-existent product', () => {
      const result = service.updateProduct('non-existent', { price: 2.49 });
      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should delete existing product', () => {
      const created = service.addProduct(ProductFixture);

      const deleted = service.deleteProduct(created.id);
      const found = service.getProduct(created.id);

      expect(deleted).toBe(true);
      expect(found).toBeNull();
    });

    it('should return false for non-existent product', () => {
      const result = service.deleteProduct('testproduct');
      expect(result).toBe(false);
    });
  });

  describe('findProductsByName', () => {
    it('should find products by partial name match', () => {
      service.addProduct(ProductFixture);
      service.addProduct(ProductVariantFixture);
      service.addProduct(ProductVariant2Fixture);

      const results = service.findProductsByName(ProductFixture.name);

      expect(results).toHaveLength(2);
      expect(results.every(p => p.name.toLowerCase().includes(ProductFixture.name))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      service.addProduct(ProductFixture);
      // geerateId used to guarntee no false positives
      const results = service.findProductsByName(generateId(10));

      expect(results).toHaveLength(0);
    });
  });


  describe('getAllProducts', () => {
    it('should return empty array when no products', () => {
      const products = service.getAllProducts();
      expect(products).toHaveLength(0);
    });

    it('should return all products', () => {
      service.addProduct(ProductFixture);
      service.addProduct(ProductVariantFixture);

      const products = service.getAllProducts();

      expect(products).toHaveLength(2);
    });
  });
});
;
