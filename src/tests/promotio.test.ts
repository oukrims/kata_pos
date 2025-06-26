import { describe, it, expect, beforeEach } from 'vitest';
import { PromoService } from '../services/promotion.service';
import { ValidationError } from '../core/errors';
import {
  ValidMarkdownFixture,
  ExpiredMarkdownFixture,
  InactiveMarkdownFixture,
  NegativeDiscountMarkdownFixture,
  InvalidDateMarkdownFixture,
  EmptyProductIdMarkdownFixture,
  BuyNGetMOffPromoFixture,
  NForXPromoFixture,
  WeightedPromoFixture,
  PercentageDiscountPromoFixture,
  FixedDiscountPromoFixture,
  ExpiredPromoFixture,
  InactivePromoFixture,
  LimitedPromoFixture
} from "./fixtures/promotion.fixture";

describe('PromoService', () => {
  let service: PromoService;

  beforeEach(() => {
    service = new PromoService();
  });

  describe('addMarkdown', () => {
    it('should create markdown with valid data', () => {
      const markdown = service.addMarkdown(ValidMarkdownFixture);

      expect(markdown.id).toBeDefined();
      expect(markdown.productId).toBe(ValidMarkdownFixture.productId);
      expect(markdown.discountAmount).toBe(ValidMarkdownFixture.discountAmount);
      expect(markdown.validFrom).toEqual(ValidMarkdownFixture.validFrom);
      expect(markdown.validTo).toEqual(ValidMarkdownFixture.validTo);
      expect(markdown.isActive).toBe(true);
      expect(markdown.createdAt).toBeInstanceOf(Date);
    });

    it('should set default isActive to true when not specified', () => {
      const markdownWithoutActive = { ...ValidMarkdownFixture };

      const markdown = service.addMarkdown(markdownWithoutActive);

      expect(markdown.isActive).toBe(true);
    });

    it('should preserve reason and priority when provided', () => {
      const markdownWithExtras = {
        ...ValidMarkdownFixture,
        reason: 'Black friday sale',
        priority: 1
      };

      const markdown = service.addMarkdown(markdownWithExtras);

      expect(markdown.reason).toBe('black friday sale');
      expect(markdown.priority).toBe(1);
    });

    it('should generate unique IDs for markdowns', () => {
      const markdown1 = service.addMarkdown(ValidMarkdownFixture);
      const markdown2 = service.addMarkdown(ValidMarkdownFixture);

      expect(markdown1.id).not.toBe(markdown2.id);
    });

    it('should throw ValidationError for invalid dates', () => {
      expect(() => service.addMarkdown(InvalidDateMarkdownFixture))
        .toThrow(ValidationError);
    });

    it('should throw ValidationError for negative discount', () => {
      expect(() => service.addMarkdown(NegativeDiscountMarkdownFixture))
        .toThrow(ValidationError);
    });

    it('should throw ValidationError for empty productId', () => {
      expect(() => service.addMarkdown(EmptyProductIdMarkdownFixture))
        .toThrow(ValidationError);
    });
  });

  describe('getActiveMarkdowns', () => {
    it('should return active markdowns for product', () => {
      const productId = ValidMarkdownFixture.productId;
      service.addMarkdown(ValidMarkdownFixture);

      const activeMarkdowns = service.getActiveMarkdowns(productId);

      expect(activeMarkdowns).toHaveLength(1);
      expect(activeMarkdowns[0].productId).toBe(productId);
      expect(activeMarkdowns[0].discountAmount).toBe(ValidMarkdownFixture.discountAmount);
      expect(activeMarkdowns[0].isActive).toBe(true);
    });

    it('should not return inactive markdowns', () => {
      const productId = InactiveMarkdownFixture.productId;
      service.addMarkdown(InactiveMarkdownFixture);

      const activeMarkdowns = service.getActiveMarkdowns(productId);

      expect(activeMarkdowns).toHaveLength(0);
    });

    it('should not return expired markdowns', () => {
      const productId = ExpiredMarkdownFixture.productId;
      service.addMarkdown(ExpiredMarkdownFixture);

      const activeMarkdowns = service.getActiveMarkdowns(productId);

      expect(activeMarkdowns).toHaveLength(0);
    });

    it('should return empty array for non-existent product', () => {
      const activeMarkdowns = service.getActiveMarkdowns('non-existent');
      expect(activeMarkdowns).toHaveLength(0);
    });

    it('should return multiple active markdowns for same product', () => {
      const productId = ValidMarkdownFixture.productId;
      const secondMarkdown = { ...ValidMarkdownFixture, discountAmount: 1.00 };

      service.addMarkdown(ValidMarkdownFixture);
      service.addMarkdown(secondMarkdown);

      const activeMarkdowns = service.getActiveMarkdowns(productId);

      expect(activeMarkdowns).toHaveLength(2);
      expect(activeMarkdowns.every(m => m.productId === productId)).toBe(true);
      expect(activeMarkdowns.every(m => m.isActive === true)).toBe(true);
    });
  });

  describe('deactivateMarkdown', () => {
    it('should deactivate existing markdown', () => {
      const markdown = service.addMarkdown(ValidMarkdownFixture);

      const result = service.deactivateMarkdown(markdown.id);

      expect(result).toBe(true);

      const activeMarkdowns = service.getActiveMarkdowns(ValidMarkdownFixture.productId);
      expect(activeMarkdowns).toHaveLength(0);
    });

    it('should return false for non-existent markdown', () => {
      const result = service.deactivateMarkdown('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('addPromo', () => {
    it('should create buy N get M off promotion', () => {
      const promo = service.addPromo(BuyNGetMOffPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.type).toBe('buyNgetMoff');
      expect(promo.buyQuantity).toBe(BuyNGetMOffPromoFixture.buyQuantity);
      expect(promo.getQuantity).toBe(BuyNGetMOffPromoFixture.getQuantity);
      expect(promo.discountPercent).toBe(BuyNGetMOffPromoFixture.discountPercent);
      expect(promo.productId).toBe(BuyNGetMOffPromoFixture.productId);
      expect(promo.createdAt).toBeInstanceOf(Date);
    });

    it('should create N for X promotion', () => {
      const promo = service.addPromo(NForXPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.type).toBe('nForX');
      expect(promo.quantity).toBe(NForXPromoFixture.quantity);
      expect(promo.price).toBe(NForXPromoFixture.price);
      expect(promo.productId).toBe(NForXPromoFixture.productId);
    });

    it('should create weighted special promotion', () => {
      const promo = service.addPromo(WeightedPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.type).toBe('weighted');
      expect(promo.buyWeight).toBe(WeightedPromoFixture.buyWeight);
      expect(promo.getWeight).toBe(WeightedPromoFixture.getWeight);
      expect(promo.discountPercent).toBe(WeightedPromoFixture.discountPercent);
    });

    it('should create percentage discount promotion', () => {
      const promo = service.addPromo(PercentageDiscountPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.type).toBe('percentage');
      expect(promo.discountPercent).toBe(PercentageDiscountPromoFixture.discountPercent);
      expect(promo.minimumQuantity).toBe(PercentageDiscountPromoFixture.minimumQuantity);
    });

    it('should create fixed discount promotion', () => {
      const promo = service.addPromo(FixedDiscountPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.type).toBe('fixed');
      expect(promo.discountAmount).toBe(FixedDiscountPromoFixture.discountAmount);
      expect(promo.minimumAmount).toBe(FixedDiscountPromoFixture.minimumAmount);
    });

    it('should create promotion with application limits', () => {
      const promo = service.addPromo(LimitedPromoFixture);

      expect(promo.id).toBeDefined();
      expect(promo.maxApplications).toBe(LimitedPromoFixture.maxApplications);
      expect(promo.type).toBe('buyNgetMoff');
    });

    it('should generate unique IDs for promotions', () => {
      const promo1 = service.addPromo(BuyNGetMOffPromoFixture);
      const promo2 = service.addPromo(BuyNGetMOffPromoFixture);

      expect(promo1.id).not.toBe(promo2.id);
    });

    it('should preserve optional fields when provided', () => {
      const promoWithExtras = {
        ...BuyNGetMOffPromoFixture,
        description: 'Special holiday offer',
        priority: 5,
        stackable: true
      };

      const promo = service.addPromo(promoWithExtras);

      expect(promo.description).toBe('Special holiday offer');
      expect(promo.priority).toBe(5);
      expect(promo.stackable).toBe(true);
    });

    it('should handle all promotion types correctly', () => {
      const buyNGetM = service.addPromo(BuyNGetMOffPromoFixture);
      const nForX = service.addPromo(NForXPromoFixture);
      const weighted = service.addPromo(WeightedPromoFixture);
      const percentage = service.addPromo(PercentageDiscountPromoFixture);
      const fixed = service.addPromo(FixedDiscountPromoFixture);

      expect(buyNGetM.type).toBe('buyNgetMoff');
      expect(nForX.type).toBe('nForX');
      expect(weighted.type).toBe('weighted');
      expect(percentage.type).toBe('percentage');
      expect(fixed.type).toBe('fixed');
    });
  });

  describe('getActivePromos', () => {
    it('should return active promotions for product', () => {
      const productId = BuyNGetMOffPromoFixture.productId;
      service.addPromo(BuyNGetMOffPromoFixture);

      const activePromos = service.getActivePromos(productId);

      expect(activePromos).toHaveLength(1);
      expect(activePromos[0].productId).toBe(productId);
      expect(activePromos[0].type).toBe('buyNgetMoff');
      expect(activePromos[0].isActive).toBe(true);
    });

    it('should not return inactive promotions', () => {
      const productId = InactivePromoFixture.productId;
      service.addPromo(InactivePromoFixture);

      const activePromos = service.getActivePromos(productId);

      expect(activePromos).toHaveLength(0);
    });

    it('should not return expired promotions', () => {
      const productId = ExpiredPromoFixture.productId;
      service.addPromo(ExpiredPromoFixture);

      const activePromos = service.getActivePromos(productId);

      expect(activePromos).toHaveLength(0);
    });

    it('should return multiple active promotions for same product', () => {
      const productId = BuyNGetMOffPromoFixture.productId;
      const secondPromo = { ...NForXPromoFixture, productId };

      service.addPromo(BuyNGetMOffPromoFixture);
      service.addPromo(secondPromo);

      const activePromos = service.getActivePromos(productId);

      expect(activePromos).toHaveLength(2);
      expect(activePromos.every(p => p.productId === productId)).toBe(true);
      expect(activePromos.every(p => p.isActive === true)).toBe(true);
    });

    it('should return empty array for non-existent product', () => {
      const activePromos = service.getActivePromos('non-existent');
      expect(activePromos).toHaveLength(0);
    });

    it('should return different promotion types for same product', () => {
      const productId = BuyNGetMOffPromoFixture.productId;
      const buyNGetM = { ...BuyNGetMOffPromoFixture, productId };
      const percentage = { ...PercentageDiscountPromoFixture, productId };

      service.addPromo(buyNGetM);
      service.addPromo(percentage);

      const activePromos = service.getActivePromos(productId);

      expect(activePromos).toHaveLength(2);
      expect(activePromos.map(p => p.type)).toContain('buyNgetMoff');
      expect(activePromos.map(p => p.type)).toContain('percentage');
    });
  });

  describe('deactivatePromo', () => {
    it('should deactivate existing promotion', () => {
      const promo = service.addPromo(BuyNGetMOffPromoFixture);

      const result = service.deactivatePromo(promo.id);

      expect(result).toBe(true);

      const activePromos = service.getActivePromos(BuyNGetMOffPromoFixture.productId);
      expect(activePromos).toHaveLength(0);
    });

    it('should return false for non-existent promotion', () => {
      const result = service.deactivatePromo('non-existent');
      expect(result).toBe(false);
    });

    it('should deactivate only the specified promotion', () => {
      const productId = BuyNGetMOffPromoFixture.productId;
      const promo1 = service.addPromo(BuyNGetMOffPromoFixture);
      const promo2 = service.addPromo({ ...NForXPromoFixture, productId });

      service.deactivatePromo(promo1.id);

      const activePromos = service.getActivePromos(productId);
      expect(activePromos).toHaveLength(1);
      expect(activePromos[0].id).toBe(promo2.id);
      expect(activePromos[0].type).toBe('nForX');
    });

    it('should not affect already inactive promotions', () => {
      const inactivePromo = service.addPromo(InactivePromoFixture);

      const result = service.deactivatePromo(inactivePromo.id);

      expect(result).toBe(true);
    });

    it('should deactivate promotions of different types', () => {
      const buyNGetM = service.addPromo(BuyNGetMOffPromoFixture);
      const weighted = service.addPromo(WeightedPromoFixture);

      service.deactivatePromo(buyNGetM.id);
      service.deactivatePromo(weighted.id);

      expect(service.getActivePromos(BuyNGetMOffPromoFixture.productId)).toHaveLength(0);
      expect(service.getActivePromos(WeightedPromoFixture.productId)).toHaveLength(0);
    });
  });

  describe('getAllMarkdowns', () => {
    it('should return empty array when no markdowns exist', () => {
      const markdowns = service.getAllMarkdowns();
      expect(markdowns).toHaveLength(0);
    });

    it('should return all markdowns including inactive and expired', () => {
      service.addMarkdown(ValidMarkdownFixture);
      service.addMarkdown(InactiveMarkdownFixture);
      service.addMarkdown(ExpiredMarkdownFixture);

      const allMarkdowns = service.getAllMarkdowns();

      expect(allMarkdowns).toHaveLength(3);
      expect(allMarkdowns.some(m => m.isActive === true)).toBe(true);
      expect(allMarkdowns.some(m => m.isActive === false)).toBe(true);
    });

    it('should include deactivated markdowns', () => {
      const markdown = service.addMarkdown(ValidMarkdownFixture);
      service.deactivateMarkdown(markdown.id);

      const allMarkdowns = service.getAllMarkdowns();

      expect(allMarkdowns).toHaveLength(1);
      expect(allMarkdowns[0].isActive).toBe(false);
    });
  });

  describe('getAllPromos', () => {
    it('should return empty array when no promotions exist', () => {
      const promos = service.getAllPromos();
      expect(promos).toHaveLength(0);
    });

    it('should return all promotions including inactive and expired', () => {
      service.addPromo(BuyNGetMOffPromoFixture);
      service.addPromo(NForXPromoFixture);
      service.addPromo(InactivePromoFixture);
      service.addPromo(ExpiredPromoFixture);

      const allPromos = service.getAllPromos();

      expect(allPromos).toHaveLength(4);
      expect(allPromos.some(p => p.isActive === true)).toBe(true);
      expect(allPromos.some(p => p.isActive === false)).toBe(true);
    });

    it('should return promotions with different types', () => {
      service.addPromo(BuyNGetMOffPromoFixture);
      service.addPromo(NForXPromoFixture);
      service.addPromo(WeightedPromoFixture);
      service.addPromo(PercentageDiscountPromoFixture);
      service.addPromo(FixedDiscountPromoFixture);

      const allPromos = service.getAllPromos();

      expect(allPromos).toHaveLength(5);

      const types = allPromos.map(p => p.type);
      expect(types).toContain('buyNgetMoff');
      expect(types).toContain('nForX');
      expect(types).toContain('weighted');
      expect(types).toContain('percentage');
      expect(types).toContain('fixed');
    });

    it('should include deactivated promotions', () => {
      const promo = service.addPromo(BuyNGetMOffPromoFixture);
      service.deactivatePromo(promo.id);

      const allPromos = service.getAllPromos();

      expect(allPromos).toHaveLength(1);
      expect(allPromos[0].isActive).toBe(false);
    });
  });

  describe('promotion date validation edge cases', () => {
    it('should handle promotions starting exactly now', () => {
      const nowPromo = {
        ...BuyNGetMOffPromoFixture,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      service.addPromo(nowPromo);

      const activePromos = service.getActivePromos(nowPromo.productId);
      expect(activePromos).toHaveLength(1);
    });

    it('should handle promotions ending exactly now', () => {
      const endingNowPromo = {
        ...BuyNGetMOffPromoFixture,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validTo: new Date()
      };
      service.addPromo(endingNowPromo);

      const activePromos = service.getActivePromos(endingNowPromo.productId);
      expect(activePromos).toHaveLength(1);
    });

    it('should handle markdowns starting exactly now', () => {
      const nowMarkdown = {
        ...ValidMarkdownFixture,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      service.addMarkdown(nowMarkdown);

      const activeMarkdowns = service.getActiveMarkdowns(nowMarkdown.productId);
      expect(activeMarkdowns).toHaveLength(1);
    });
  });
});
