import { describe, it, expect, beforeEach } from 'vitest';
import { POSSystemFactory, IPOSSystem } from '../factory/pos.factory';
import { ValidationError } from '../core/errors';
import { BuyNGetMOffSpecial, WeightedSpecial } from '../core/types';

describe('POS System Integration Tests', () => {
  let pos: IPOSSystem;

  beforeEach(() => {
    pos = POSSystemFactory.create();
  });

  it('should handle complete shopping scenario with mixed items and promotions', () => {
    const soup = pos.products.add({
      name: 'Campbell Soup',
      price: 1.89,
      isWeighted: false,
      createdAt: new Date()
    });

    const bananas = pos.products.add({
      name: 'Bananas',
      price: 2.38,
      isWeighted: true,
      createdAt: new Date()
    });

    const bread = pos.products.add({
      name: 'Wonder Bread',
      price: 2.50,
      isWeighted: false,
      createdAt: new Date()
    });

    pos.promotions.addPromotion({
      type: 'buyNgetMoff',
      productId: soup.id,
      validFrom: new Date(Date.now() - 1000),
      validTo: new Date(Date.now() + 86400000),
      isActive: true,
      buyQuantity: 1,
      getQuantity: 1,
      discountPercent: 100
    } as Omit<BuyNGetMOffSpecial, 'id' | 'createdAt' | 'updatedAt'>);

    pos.promotions.addMarkdown({
      productId: bread.id,
      discountAmount: 0.25,
      validFrom: new Date(Date.now() - 1000),
      validTo: new Date(Date.now() + 86400000),
      isActive: true
    });

    pos.checkout.scan(soup.id);
    pos.checkout.scan(soup.id);
    pos.checkout.scan(bananas.id, 1.5);
    pos.checkout.scan(bread.id);

    const expectedTotal = 1.89 + (2.38 * 1.5) + (2.50 - 0.25);
    expect(pos.checkout.total()).toBe(expectedTotal);
  });

  it('should handle promotion lifecycle and cart modifications', () => {
    const product = pos.products.add({
      name: 'Sale Item',
      price: 5.00,
      isWeighted: false,
      createdAt: new Date()
    });

    const markdown = pos.promotions.addMarkdown({
      productId: product.id,
      discountAmount: 1.00,
      validFrom: new Date(Date.now() - 1000),
      validTo: new Date(Date.now() + 86400000),
      isActive: true
    });

    pos.checkout.scan(product.id);
    pos.checkout.scan(product.id);
    expect(pos.checkout.total()).toBe(8.00);

    pos.checkout.remove(product.id);
    expect(pos.checkout.total()).toBe(4.00);

    pos.promotions.deactivateMarkdown(markdown.id);
    pos.checkout.reset();
    pos.checkout.scan(product.id);
    expect(pos.checkout.total()).toBe(5.00);
  });

  it('should handle weighted items with promotions and aggregation', () => {
    const meat = pos.products.add({
      name: 'Ground Beef',
      price: 6.00,
      isWeighted: true,
      createdAt: new Date()
    });

    pos.promotions.addPromotion({
      type: 'weighted',
      productId: meat.id,
      validFrom: new Date(Date.now() - 1000),
      validTo: new Date(Date.now() + 86400000),
      isActive: true,
      buyWeight: 1.0,
      getWeight: 0.5,
      discountPercent: 100
    } as Omit<WeightedSpecial, 'id' | 'createdAt' | 'updatedAt'>);

    pos.checkout.scan(meat.id, 1.0);
    pos.checkout.scan(meat.id, 0.5);
    expect(pos.checkout.total()).toBe(6.00);

    pos.checkout.remove(meat.id, 0.5);
    expect(pos.checkout.total()).toBe(6.00);
  });

  it('should maintain data consistency and handle errors gracefully', () => {
    const product = pos.products.add({
      name: 'Test Product',
      price: 5.99,
      isWeighted: false,
      createdAt: new Date()
    });

    expect(() => pos.products.add({
      name: '',
      price: -1.00,
      isWeighted: false,
      createdAt: new Date()
    })).toThrow(ValidationError);

    expect(() => pos.checkout.scan('non-existent')).toThrow('Product not found');

    pos.checkout.scan(product.id);
    expect(pos.checkout.total()).toBe(5.99);

    pos.products.delete(product.id);
    expect(() => pos.checkout.scan(product.id)).toThrow('Product not found');
  });
});
