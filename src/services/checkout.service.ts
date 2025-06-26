import { IProductService, IPromoService } from '../interfaces';

export class CheckoutService {
  constructor(
    private productService: IProductService,
    private promoService: IPromoService
  ) {}

  scan(productId: string): number {
    const product = this.productService.getProduct(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    return product.price;
  }
}
