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

  it('should apply buy 2 get 1 50% off promotion', () => {
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
});
