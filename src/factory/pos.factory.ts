import { ProductService } from '../services/product.service';
import { PromoService } from '../services/promotion.service';
import { CheckoutService } from '../services/checkout.service';
import { Product, Markdown, Promotion } from '../core/types';

export interface IPOSSystem {
  products: {
    add(product: Omit<Product, 'id'>): Product;
    get(id: string): Product | null;
    getAll(): Product[];
    update(id: string, updates: Partial<Product>): Product | null;
    delete(id: string): boolean;
    findByName(name: string): Product[];
  };

  promotions: {
    addMarkdown(markdown: Omit<Markdown, 'id' | 'createdAt' | 'updatedAt'>): Markdown;
    addPromotion(promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>): Promotion;
    getActiveMarkdowns(productId: string): Markdown[];
    getActivePromotions(productId: string): Promotion[];
    deactivateMarkdown(id: string): boolean;
    deactivatePromotion(id: string): boolean;
    getAllMarkdowns(): Markdown[];
    getAllPromotions(): Promotion[];
  };

  checkout: {
    scan(productId: string, weight?: number): number;
    total(): number;
    remove(productId: string, weight?: number): boolean;
    reset(): void;
  };
}

export class POSSystemFactory {
  static create(): IPOSSystem {
    const productService = new ProductService();
    const promoService = new PromoService();
    const checkoutService = new CheckoutService(productService, promoService);

    return {
      products: {
        add: (product) => productService.addProduct(product),
        get: (id) => productService.getProduct(id),
        getAll: () => productService.getAllProducts(),
        update: (id, updates) => productService.updateProduct(id, updates),
        delete: (id) => productService.deleteProduct(id),
        findByName: (name) => productService.findProductsByName(name)
      },

      promotions: {
        addMarkdown: (markdown) => promoService.addMarkdown(markdown),
        addPromotion: (promotion) => promoService.addPromo(promotion),
        getActiveMarkdowns: (productId) => promoService.getActiveMarkdowns(productId),
        getActivePromotions: (productId) => promoService.getActivePromos(productId),
        deactivateMarkdown: (id) => promoService.deactivateMarkdown(id),
        deactivatePromotion: (id) => promoService.deactivatePromo(id),
        getAllMarkdowns: () => promoService.getAllMarkdowns(),
        getAllPromotions: () => promoService.getAllPromos()
      },

      checkout: {
        scan: (productId, weight) => checkoutService.scan(productId, weight),
        total: () => checkoutService.total(),
        remove: (productId, weight) => checkoutService.remove(productId, weight),
        reset: () => checkoutService.reset()
      }
    };
  }
}
