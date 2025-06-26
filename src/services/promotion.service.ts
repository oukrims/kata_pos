import { Markdown, Promotion, BuyNGetMOffSpecial, NForXSpecial, WeightedSpecial } from '../core/types';
import { IPromoService } from '../interfaces';
import { generateId, validateMarkdown, validatePromotion } from '../core/utils';

export class PromoService implements IPromoService {
  private markdowns = new Map<string, Markdown>();
  private promotions = new Map<string, Promotion>();

  addMarkdown(markdown: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'>): Markdown {
    validateMarkdown(markdown);

    const newMarkdown: Markdown = {
      ...markdown,
      id: generateId(),
      createdAt: new Date()
    };

    this.markdowns.set(newMarkdown.id, newMarkdown);
    return newMarkdown;
  }

  getActiveMarkdowns(productId: string): Markdown[] {
    const now = new Date();
    return Array.from(this.markdowns.values()).filter(markdown =>
      markdown.productId === productId &&
      markdown.isActive &&
      markdown.validFrom <= now &&
      markdown.validTo > now
    );
  }

  deactivateMarkdown(id: string): boolean {
    const markdown = this.markdowns.get(id);
    if (!markdown) return false;

    const updated = { ...markdown, isActive: false, updatedAt: new Date() };
    this.markdowns.set(id, updated);
    return true;
  }

  addPromo(promo: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>): Promotion {
    validatePromotion(promo);

    const newPromo: Promotion = {
      ...promo,
      id: generateId(),
      createdAt: new Date()
    } as Promotion;

    this.promotions.set(newPromo.id, newPromo);
    return newPromo;
  }

  addBuyNGetMOffPromo(promo: Omit<BuyNGetMOffSpecial, 'id' | 'createdAt' | 'updatedAt'>): BuyNGetMOffSpecial {
    return this.addPromo(promo) as BuyNGetMOffSpecial;
  }

  addNForXPromo(promo: Omit<NForXSpecial, 'id' | 'createdAt' | 'updatedAt'>): NForXSpecial {
    return this.addPromo(promo) as NForXSpecial;
  }

  addWeightedPromo(promo: Omit<WeightedSpecial, 'id' | 'createdAt' | 'updatedAt'>): WeightedSpecial {
    return this.addPromo(promo) as WeightedSpecial;
  }

  getActivePromos(productId: string): Promotion[] {
    const now = new Date();
    return Array.from(this.promotions.values()).filter(promo =>
      promo.productId === productId &&
      promo.isActive &&
      promo.validFrom <= now &&
      promo.validTo > now
    );
  }

  deactivatePromo(id: string): boolean {
    const promo = this.promotions.get(id);
    if (!promo) return false;

    const updated = { ...promo, isActive: false, updatedAt: new Date() };
    this.promotions.set(id, updated);
    return true;
  }

  getAllMarkdowns(): Markdown[] {
    return Array.from(this.markdowns.values());
  }

  getAllPromos(): Promotion[] {
    return Array.from(this.promotions.values());
  }
}
