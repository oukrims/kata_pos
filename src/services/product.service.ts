import { Product } from '../core/types';
import { IProductService } from '../interfaces';
import { generateId, validateProduct } from '../core/utils';

export class ProductService implements IProductService {
  private products = new Map<string, Product>();

  addProduct(product: Omit<Product, 'id'>): Product {
    validateProduct(product);

    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date()
    };

    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  getProduct(id: string): Product | null {
    return this.products.get(id) || null;
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, id: existing.id };
    validateProduct(updated);

    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  findProductsByName(name: string): Product[] {
    const searchTerm = name.toLowerCase();
    return Array.from(this.products.values())
      .filter(product => product.name.toLowerCase().includes(searchTerm));
  }
}
