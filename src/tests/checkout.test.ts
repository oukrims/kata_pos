import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService } from '../services/checkout.service';
import { ProductService } from '../services/product.service';
import { PromoService } from '../services/promotion.service';

describe('CheckoutService', () => {
  let checkout: CheckoutService;
  let productService: ProductService;
  let promoService: PromoService;

  beforeEach(() => {
    productService = new ProductService();
    promoService = new PromoService();
    checkout = new CheckoutService(productService, promoService);
  });

  describe('scanning per-unit items', () => {
    it('should calculate total for single item', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      const total = checkout.scan(apple.id);

      expect(total).toBe(1.50);
    });

    it('should calculate total for multiple same items', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      checkout.scan(apple.id);
      const total = checkout.total();

      expect(total).toBe(3.00);
    });

    it('should increase total by per-unit price after scan', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 1.89,
        isWeighted: false,
        createdAt: new Date()
      });

      const scanPrice = checkout.scan(soup.id);
      expect(scanPrice).toBe(1.89);
      expect(checkout.total()).toBe(1.89);
    });

    it('should reject weight for non-weighted items', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 1.89,
        isWeighted: false,
        createdAt: new Date()
      });

      expect(() => checkout.scan(soup.id, 2.0)).toThrow('Weight not allowed for non-weighted product');
    });
  });

  describe('scanning weighted items', () => {
    it('should calculate price based on weight for weighted items', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 5.99,
        isWeighted: true,
        createdAt: new Date()
      });

      const scanPrice = checkout.scan(groundBeef.id, 1.5);
      expect(scanPrice).toBe(8.985);
      expect(checkout.total()).toBe(8.985);
    });

    it('should require weight for weighted items', () => {
      const bananas = productService.addProduct({
        name: 'Bananas',
        price: 2.38,
        isWeighted: true,
        createdAt: new Date()
      });

      expect(() => checkout.scan(bananas.id)).toThrow('Weight required for weighted product');
    });

    it('should handle multiple weighted items', () => {
      const bananas = productService.addProduct({
        name: 'Bananas',
        price: 2.38,
        isWeighted: true,
        createdAt: new Date()
      });

      checkout.scan(bananas.id, 1.2);
      checkout.scan(bananas.id, 0.8);
      const total = checkout.total();

      expect(total).toBe(2.38 * 2.0);
    });
  });

  describe('markdowns', () => {
    it('should apply markdown to per-unit items', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 1.89,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addMarkdown({
        productId: soup.id,
        discountAmount: 0.20,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true
      });

      checkout.scan(soup.id);
      expect(checkout.total()).toBe(1.69);
    });

    it('should apply markdown to weighted items', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 5.99,
        isWeighted: true,
        createdAt: new Date()
      });

      promoService.addMarkdown({
        productId: groundBeef.id,
        discountAmount: 0.50,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true
      });

      checkout.scan(groundBeef.id, 2.0);
      expect(checkout.total()).toBe((5.99 - 0.50) * 2.0);
    });

    it('should apply multiple markdowns', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addMarkdown({
        productId: soup.id,
        discountAmount: 0.25,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true
      });

      promoService.addMarkdown({
        productId: soup.id,
        discountAmount: 0.15,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true
      });

      checkout.scan(soup.id);
      expect(checkout.total()).toBe(1.60);
    });
  });

  describe('buy N get M at %X off promotions', () => {
    it('should apply buy 1 get 1 free', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 1.89,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 1,
        getQuantity: 1,
        discountPercent: 100
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      expect(checkout.total()).toBe(1.89);
    });

    it('should apply buy 2 get 1 half off', () => {
      const cereal = productService.addProduct({
        name: 'Cereal',
        price: 4.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: cereal.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 2,
        getQuantity: 1,
        discountPercent: 50
      });

      checkout.scan(cereal.id);
      checkout.scan(cereal.id);
      checkout.scan(cereal.id);
      const total = checkout.total();

      expect(total).toBe(10.00);
    });

    it('should handle multiple promotion sets', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 1,
        getQuantity: 1,
        discountPercent: 100
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      expect(checkout.total()).toBe(4.00);
    });
  });

  describe('N for $X promotions', () => {
    it('should apply 3 for $5 promotion', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'nForX',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        quantity: 3,
        price: 5.00
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      const total = checkout.total();

      expect(total).toBe(5.00);
    });

    it('should handle partial promotion quantities', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'nForX',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        quantity: 3,
        price: 5.00
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      expect(checkout.total()).toBe(7.00);
    });

    it('should handle multiple promotion sets', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'nForX',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        quantity: 3,
        price: 5.00
      });

      for (let i = 0; i < 7; i++) {
        checkout.scan(soup.id);
      }
      expect(checkout.total()).toBe(12.00);
    });
  });

  describe('weighted item promotions', () => {
    it('should apply weighted special correctly', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 6.00,
        isWeighted: true,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'weighted',
        productId: groundBeef.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyWeight: 2.0,
        getWeight: 1.0,
        discountPercent: 50
      });

      checkout.scan(groundBeef.id, 3.0);
      expect(checkout.total()).toBe(15.00);
    });

    it('should handle multiple weighted promotion sets', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 4.00,
        isWeighted: true,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'weighted',
        productId: groundBeef.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyWeight: 1.0,
        getWeight: 0.5,
        discountPercent: 25
      });

      checkout.scan(groundBeef.id, 4.5);
      expect(checkout.total()).toBe(16.50);
    });
  });

  describe('promotion limits', () => {
    it('should enforce maxApplications limit on buy N get M off', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 1.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 2,
        getQuantity: 1,
        discountPercent: 100,
        maxApplications: 2
      });

      for (let i = 0; i < 9; i++) {
        checkout.scan(soup.id);
      }

      expect(checkout.total()).toBe(7.00);
    });

    it('should enforce maxApplications limit on N for X', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'nForX',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        quantity: 3,
        price: 5.00,
        maxApplications: 1
      });

      for (let i = 0; i < 6; i++) {
        checkout.scan(soup.id);
      }

      expect(checkout.total()).toBe(11.00);
    });

    it('should enforce maxApplications limit on weighted promotions', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 4.00,
        isWeighted: true,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'weighted',
        productId: groundBeef.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyWeight: 1.0,
        getWeight: 1.0,
        discountPercent: 50,
        maxApplications: 1
      });

      checkout.scan(groundBeef.id, 4.0);
      expect(checkout.total()).toBe(14.00);
    });
  });

  describe('item removal', () => {
    it('should reset cart', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      checkout.reset();
      const total = checkout.total();

      expect(total).toBe(0);
    });

    it('should remove single item from cart', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      checkout.scan(apple.id);
      checkout.remove(apple.id);
      const total = checkout.total();

      expect(total).toBe(1.50);
    });

    it('should return false when removing non-existent item', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      const result = checkout.remove('non-existent');

      expect(result).toBe(false);
      expect(checkout.total()).toBe(1.50);
    });

    it('should return true when successfully removing item', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      const result = checkout.remove(apple.id);

      expect(result).toBe(true);
      expect(checkout.total()).toBe(0);
    });

    it('should recalculate promotions after removing item', () => {
      const cereal = productService.addProduct({
        name: 'Cereal',
        price: 4.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: cereal.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 2,
        getQuantity: 1,
        discountPercent: 50
      });

      checkout.scan(cereal.id);
      checkout.scan(cereal.id);
      checkout.scan(cereal.id);
      expect(checkout.total()).toBe(10.00);

      checkout.remove(cereal.id);
      expect(checkout.total()).toBe(8.00);
    });

    it('should remove item and invalidate N for X special', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addPromo({
        type: 'nForX',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        quantity: 3,
        price: 5.00
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      checkout.scan(soup.id);
      expect(checkout.total()).toBe(5.00);

      checkout.remove(soup.id);
      expect(checkout.total()).toBe(4.00);
    });

    it('should remove weighted item correctly', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 5.99,
        isWeighted: true,
        createdAt: new Date()
      });

      checkout.scan(groundBeef.id, 1.0);
      checkout.scan(groundBeef.id, 2.0);
      expect(checkout.total()).toBe(17.97);

      checkout.remove(groundBeef.id, 1.0);
      expect(checkout.total()).toBe(11.98);
    });

    it('should not remove weighted item without matching weight', () => {
      const groundBeef = productService.addProduct({
        name: 'Ground Beef',
        price: 5.99,
        isWeighted: true,
        createdAt: new Date()
      });

      checkout.scan(groundBeef.id, 1.5);
      const result = checkout.remove(groundBeef.id, 2.0);

      expect(result).toBe(false);
      expect(checkout.total()).toBe(8.985);
    });
  });

  describe('error handling', () => {
    it('should throw error for non-existent product', () => {
      expect(() => checkout.scan('non-existent')).toThrow('Product not found: non-existent');
    });
  });

  describe('mixed cart scenarios', () => {
    it('should handle mixed weighted and unit items', () => {
      const apple = productService.addProduct({
        name: 'Apple',
        price: 1.50,
        isWeighted: false,
        createdAt: new Date()
      });

      const bananas = productService.addProduct({
        name: 'Bananas',
        price: 2.38,
        isWeighted: true,
        createdAt: new Date()
      });

      checkout.scan(apple.id);
      checkout.scan(bananas.id, 1.5);
      checkout.scan(apple.id);

      expect(checkout.total()).toBe(6.57);
    });

    it('should apply markdowns and promotions together', () => {
      const soup = productService.addProduct({
        name: 'Soup',
        price: 2.00,
        isWeighted: false,
        createdAt: new Date()
      });

      promoService.addMarkdown({
        productId: soup.id,
        discountAmount: 0.25,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true
      });

      promoService.addPromo({
        type: 'buyNgetMoff',
        productId: soup.id,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 86400000),
        isActive: true,
        buyQuantity: 1,
        getQuantity: 1,
        discountPercent: 50
      });

      checkout.scan(soup.id);
      checkout.scan(soup.id);
      expect(checkout.total()).toBe(2.625);
    });
  });
});
