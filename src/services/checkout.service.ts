import { IProductService, IPromoService } from '../interfaces';
import { BuyNGetMOffSpecial, NForXSpecial } from '../core/types';

export class CheckoutService {
  private items: string[] = [];

  constructor(
    private productService: IProductService,
    private promoService: IPromoService
  ) {}

  scan(productId: string): number {
    const product = this.productService.getProduct(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    this.items.push(productId);
    return product.price;
  }

  total(): number {
    const itemCounts = new Map<string, number>();

    for (const productId of this.items) {
      itemCounts.set(productId, (itemCounts.get(productId) || 0) + 1);
    }

    let total = 0;
    for (const [productId, quantity] of itemCounts) {
      const product = this.productService.getProduct(productId)!;
      const promos = this.promoService.getActivePromos(productId);

      let itemTotal = product.price * quantity;

      for (const promo of promos) {
        if (promo.type === 'buyNgetMoff') {
          const buyNGetM = promo as BuyNGetMOffSpecial;
          const eligibleSets = Math.floor(quantity / (buyNGetM.buyQuantity + buyNGetM.getQuantity));
          const discount = eligibleSets * buyNGetM.getQuantity * product.price * (buyNGetM.discountPercent / 100);
          itemTotal -= discount;
        } else if (promo.type === 'nForX') {
          const nForX = promo as NForXSpecial;
          const eligibleSets = Math.floor(quantity / nForX.quantity);
          const remainingItems = quantity % nForX.quantity;
          itemTotal = (eligibleSets * nForX.price) + (remainingItems * product.price);
        }
      }

      total += itemTotal;
    }

    return total;
  }

  reset(): void {
    this.items = [];
  }

  remove(productId: string): boolean {
    const index = this.items.indexOf(productId);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }
}
