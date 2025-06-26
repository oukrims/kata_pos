import { IProductService, IPromoService } from '../interfaces';

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
    return this.items.reduce((sum, productId) => {
      const product = this.productService.getProduct(productId)!;
      return sum + product.price;
    }, 0);
  }
}
