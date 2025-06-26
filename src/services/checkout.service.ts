import { IProductService, IPromoService } from '../interfaces';
import { BuyNGetMOffSpecial, NForXSpecial, WeightedSpecial } from '../core/types';

interface CartItem {
  productId: string;
  weight?: number;
}

export class CheckoutService {
  private items: CartItem[] = [];

  constructor(
    private productService: IProductService,
    private promoService: IPromoService
  ) {}

  scan(productId: string, weight?: number): number {
    const product = this.productService.getProduct(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (product.isWeighted && weight === undefined) {
      throw new Error(`Weight required for weighted product: ${productId}`);
    }

    if (!product.isWeighted && weight !== undefined) {
      throw new Error(`Weight not allowed for non-weighted product: ${productId}`);
    }

    this.items.push({ productId, weight });

    return product.isWeighted && weight ? product.price * weight : product.price;
  }

  total(): number {
    const unitItems = new Map<string, number>();
    const weightedItems = new Map<string, number>();

    for (const item of this.items) {
      const product = this.productService.getProduct(item.productId)!;

      if (product.isWeighted && item.weight) {
        const currentWeight = weightedItems.get(item.productId) || 0;
        weightedItems.set(item.productId, currentWeight + item.weight);
      } else {
        const currentCount = unitItems.get(item.productId) || 0;
        unitItems.set(item.productId, currentCount + 1);
      }
    }

    let total = 0;

    for (const [productId, quantity] of unitItems) {
      total += this.calculateUnitItemTotal(productId, quantity);
    }

    for (const [productId, totalWeight] of weightedItems) {
      total += this.calculateWeightedItemTotal(productId, totalWeight);
    }

    return total;
  }

  private calculateUnitItemTotal(productId: string, quantity: number): number {
    const product = this.productService.getProduct(productId)!;
    const markdowns = this.promoService.getActiveMarkdowns(productId);
    const promos = this.promoService.getActivePromos(productId);

    let unitPrice = product.price;

    for (const markdown of markdowns) {
      unitPrice -= markdown.discountAmount;
    }

    let itemTotal = unitPrice * quantity;

    for (const promo of promos) {
      if (promo.type === 'buyNgetMoff') {
        const buyNGetM = promo as BuyNGetMOffSpecial;
        const eligibleSets = Math.floor(quantity / (buyNGetM.buyQuantity + buyNGetM.getQuantity));
        let applicableSets = eligibleSets;

        if (promo.maxApplications) {
          applicableSets = Math.min(eligibleSets, promo.maxApplications);
        }

        const discount = applicableSets * buyNGetM.getQuantity * unitPrice * (buyNGetM.discountPercent / 100);
        itemTotal -= discount;
      } else if (promo.type === 'nForX') {
        const nForX = promo as NForXSpecial;
        const eligibleSets = Math.floor(quantity / nForX.quantity);
        let applicableSets = eligibleSets;

        if (promo.maxApplications) {
          applicableSets = Math.min(eligibleSets, promo.maxApplications);
        }

        const remainingItems = quantity - (applicableSets * nForX.quantity);
        itemTotal = (applicableSets * nForX.price) + (remainingItems * unitPrice);
      }
    }

    return itemTotal;
  }

  private calculateWeightedItemTotal(productId: string, totalWeight: number): number {
    const product = this.productService.getProduct(productId)!;
    const markdowns = this.promoService.getActiveMarkdowns(productId);
    const promos = this.promoService.getActivePromos(productId);

    let pricePerPound = product.price;

    for (const markdown of markdowns) {
      pricePerPound -= markdown.discountAmount;
    }

    let itemTotal = pricePerPound * totalWeight;

    for (const promo of promos) {
      if (promo.type === 'weighted') {
        const weighted = promo as WeightedSpecial;
        const eligibleSets = Math.floor(totalWeight / (weighted.buyWeight + weighted.getWeight));
        let applicableSets = eligibleSets;

        if (promo.maxApplications) {
          applicableSets = Math.min(eligibleSets, promo.maxApplications);
        }

        const discountWeight = applicableSets * weighted.getWeight;
        const discount = discountWeight * pricePerPound * (weighted.discountPercent / 100);
        itemTotal -= discount;
      }
    }

    return itemTotal;
  }

  reset(): void {
    this.items = [];
  }

  remove(productId: string, weight?: number): boolean {
    const index = this.items.findIndex(item =>
      item.productId === productId &&
      (weight === undefined || item.weight === weight)
    );

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }
}
