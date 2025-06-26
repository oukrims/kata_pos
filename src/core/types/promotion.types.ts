import { TimestampedEntity, ID } from './common.types';

export interface Markdown extends TimestampedEntity {
  productId: ID;
  discountAmount: number;
  reason?: string;
  priority?: number;
}

export interface CreateMarkdownRequest {
  productId: ID;
  discountAmount: number;
  validFrom: Date;
  validTo: Date;
  isActive?: boolean;
  reason?: string;
  priority?: number;
}

export type PromotionType = 'buyNgetMoff' | 'nForX' | 'weighted';

export interface BasePromotion extends TimestampedEntity {
  productId: ID;
  type: PromotionType;
  maxApplications?: number;
  description?: string;
  priority?: number;
  stackable?: boolean;
}

export interface BuyNGetMOffSpecial extends BasePromotion {
  type: 'buyNgetMoff';
  buyQuantity: number;
  getQuantity: number;
  discountPercent: number;
}

export interface NForXSpecial extends BasePromotion {
  type: 'nForX';
  quantity: number;
  price: number;
}

export interface WeightedSpecial extends BasePromotion {
  type: 'weighted';
  buyWeight: number;
  getWeight: number;
  discountPercent: number;
}

export type Promotion =
  | BuyNGetMOffSpecial
  | NForXSpecial
  | WeightedSpecial;

export interface CreatePromotionRequest extends Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PromotionApplication {
  promotionId: ID;
  appliedToItems: ID[];
  discountAmount: number;
  itemsAffected: number;
  description: string;
}
