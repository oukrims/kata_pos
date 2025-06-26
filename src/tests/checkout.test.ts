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
});
