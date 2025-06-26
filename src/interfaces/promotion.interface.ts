import { Markdown, Promotion } from '../core/types';

export interface IPromoService {
  addMarkdown(markdown: Omit<Markdown, 'id'>): Markdown;
  getActiveMarkdowns(productId: string): Markdown[];
  deactivateMarkdown(id: string): boolean;

  addPromo(promo: Omit<Promotion, 'id'>): Promotion;
  getActivePromos(productId: string): Promotion[];
  deactivatePromo(id: string): boolean;

  getAllMarkdowns(): Markdown[];
  getAllPromos(): Promotion[];
}
