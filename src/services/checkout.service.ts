import { IProductService, IPromoService } from '../interfaces';
import { BuyNGetMOffSpecial, NForXSpecial, WeightedSpecial, Markdown, Promotion } from '../core/types';

interface CartItem {
  productId: string;
  weight?: number;
}

interface ProductData {
  price: number;
  isWeighted: boolean;
  markdowns: Markdown[];
  promotions: Promotion[];
}

export class CheckoutService {
  private items: CartItem[] = [];
  private productDataCache = new Map<string, ProductData>();

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
    this.invalidateCache(productId);

    return product.isWeighted && weight ? product.price * weight : product.price;
  }

  total(): number {
    const aggregatedItems = this.aggregateItems();
    let total = 0;

    for (const [productId, data] of aggregatedItems) {
      const productData = this.getOrCacheProductData(productId);
      if (!productData) continue;

      if (data.weight !== undefined) {
        total += this.calculateWeightedItemTotal(productData, data.weight);
      } else {
        total += this.calculateUnitItemTotal(productData, data.quantity);
      }
    }

    return total;
  }

  private aggregateItems(): Map<string, { quantity: number; weight?: number }> {
    const aggregated = new Map<string, { quantity: number; weight?: number }>();

    for (const item of this.items) {
      const existing = aggregated.get(item.productId);

      if (item.weight !== undefined) {
        const currentWeight = existing?.weight || 0;
        aggregated.set(item.productId, {
          quantity: 0,
          weight: currentWeight + item.weight
        });
      } else {
        const currentCount = existing?.quantity || 0;
        aggregated.set(item.productId, {
          quantity: currentCount + 1,
          weight: existing?.weight
        });
      }
    }

    return aggregated;
  }

  private getOrCacheProductData(productId: string): ProductData | null {
    if (this.productDataCache.has(productId)) {
      return this.productDataCache.get(productId)!;
    }

    const product = this.productService.getProduct(productId);
    if (!product) return null;

    const markdowns = this.promoService.getActiveMarkdowns(productId);
    const promotions = this.promoService.getActivePromos(productId);

    const productData: ProductData = {
      price: product.price,
      isWeighted: product.isWeighted,
      markdowns,
      promotions
    };

    this.productDataCache.set(productId, productData);
    return productData;
  }

  private invalidateCache(productId: string): void {
    this.productDataCache.delete(productId);
  }

  private calculateUnitItemTotal(productData: ProductData, quantity: number): number {
    let unitPrice = productData.price;

    for (const markdown of productData.markdowns) {
      unitPrice -= markdown.discountAmount;
    }

    let itemTotal = unitPrice * quantity;

    for (const promo of productData.promotions) {
      itemTotal = this.applyUnitPromotion(promo, itemTotal, unitPrice, quantity);
    }

    return itemTotal;
  }

  private calculateWeightedItemTotal(productData: ProductData, totalWeight: number): number {
    let pricePerPound = productData.price;

    for (const markdown of productData.markdowns) {
      pricePerPound -= markdown.discountAmount;
    }

    let itemTotal = pricePerPound * totalWeight;

    for (const promo of productData.promotions) {
      if (promo.type === 'weighted') {
        itemTotal = this.applyWeightedPromotion(promo as WeightedSpecial, itemTotal, pricePerPound, totalWeight);
      }
    }

    return itemTotal;
  }

  private applyUnitPromotion(promo: Promotion, currentTotal: number, unitPrice: number, quantity: number): number {
    if (promo.type === 'buyNgetMoff') {
      return this.applyBuyNGetMOff(promo as BuyNGetMOffSpecial, currentTotal, unitPrice, quantity);
    } else if (promo.type === 'nForX') {
      return this.applyNForX(promo as NForXSpecial, unitPrice, quantity);
    }
    return currentTotal;
  }

  private applyBuyNGetMOff(promo: BuyNGetMOffSpecial, currentTotal: number, unitPrice: number, quantity: number): number {
    const eligibleSets = Math.floor(quantity / (promo.buyQuantity + promo.getQuantity));
    const applicableSets = promo.maxApplications ? Math.min(eligibleSets, promo.maxApplications) : eligibleSets;

    const discount = applicableSets * promo.getQuantity * unitPrice * (promo.discountPercent / 100);
    return currentTotal - discount;
  }

  private applyNForX(promo: NForXSpecial, unitPrice: number, quantity: number): number {
    const eligibleSets = Math.floor(quantity / promo.quantity);
    const applicableSets = promo.maxApplications ? Math.min(eligibleSets, promo.maxApplications) : eligibleSets;

    const remainingItems = quantity - (applicableSets * promo.quantity);
    return (applicableSets * promo.price) + (remainingItems * unitPrice);
  }

  private applyWeightedPromotion(promo: WeightedSpecial, currentTotal: number, pricePerPound: number, totalWeight: number): number {
    const eligibleSets = Math.floor(totalWeight / (promo.buyWeight + promo.getWeight));
    const applicableSets = promo.maxApplications ? Math.min(eligibleSets, promo.maxApplications) : eligibleSets;

    const discountWeight = applicableSets * promo.getWeight;
    const discount = discountWeight * pricePerPound * (promo.discountPercent / 100);
    return currentTotal - discount;
  }

  reset(): void {
    this.items = [];
    this.productDataCache.clear();
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
    this.invalidateCache(productId);
    return true;
  }
}
