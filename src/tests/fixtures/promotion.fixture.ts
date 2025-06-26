import { Markdown, BuyNGetMOffSpecial, NForXSpecial, WeightedSpecial } from "../../core/types";
import { faker } from "@faker-js/faker";

const productId = faker.string.alphanumeric(10);
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const dayBeforeLastWeek = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

export const ValidMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId,
  discountAmount: 0.50,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  reason: "Test markdown",
  priority: 1
};

export const ExpiredMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId,
  discountAmount: 0.25,
  validFrom: dayBeforeLastWeek,
  validTo: lastWeek,
  isActive: true,
  reason: "Expired markdown",
  priority: 1
};

export const InactiveMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId,
  discountAmount: 0.75,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: false,
  reason: "Inactive markdown",
  priority: 1
};

export const NegativeDiscountMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId,
  discountAmount: -0.50,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  reason: "Invalid markdown",
  priority: 1
};

export const InvalidDateMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId,
  discountAmount: 0.50,
  validFrom: nextWeek,
  validTo: yesterday,
  isActive: true,
  reason: "Invalid date markdown",
  priority: 1
};

export const EmptyProductIdMarkdownFixture: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'> = {
  productId: "",
  discountAmount: 0.50,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  reason: "Empty product ID",
  priority: 1
};

export const BuyNGetMOffPromoFixture: Omit<BuyNGetMOffSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'buyNgetMoff',
  productId,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  buyQuantity: 2,
  getQuantity: 1,
  discountPercent: 50,
  description: "Buy 2 get 1 half off",
  priority: 1,
  stackable: false
};

export const NForXPromoFixture: Omit<NForXSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'nForX',
  productId,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  quantity: 3,
  price: 5.00,
  description: "3 for $5",
  priority: 2,
  stackable: true
};

export const WeightedPromoFixture: Omit<WeightedSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'weighted',
  productId,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  buyWeight: 1.0,
  getWeight: 0.5,
  discountPercent: 25,
  description: "Buy 1lb get 0.5lb 25% off",
  priority: 3,
  stackable: false
};

export const ExpiredPromoFixture: Omit<BuyNGetMOffSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'buyNgetMoff',
  productId,
  validFrom: dayBeforeLastWeek,
  validTo: lastWeek,
  isActive: true,
  buyQuantity: 1,
  getQuantity: 1,
  discountPercent: 100,
  description: "Expired BOGO",
  priority: 1
};

export const InactivePromoFixture: Omit<NForXSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'nForX',
  productId,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: false,
  quantity: 2,
  price: 3.00,
  description: "Inactive 2 for $3",
  priority: 1
};

export const LimitedPromoFixture: Omit<BuyNGetMOffSpecial, 'id' | 'createdAt' | 'updatedAt'> = {
  type: 'buyNgetMoff',
  productId,
  validFrom: yesterday,
  validTo: nextWeek,
  isActive: true,
  buyQuantity: 1,
  getQuantity: 1,
  discountPercent: 50,
  maxApplications: 5,
  description: "Limited BOGO 50% off",
  priority: 1
};
