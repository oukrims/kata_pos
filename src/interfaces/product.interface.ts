import { Product } from '../core/types';

export interface IProductService {
  addProduct(product: Omit<Product, 'id'>): Product;
  getProduct(id: string): Product | null;
  getAllProducts(): Product[];
  updateProduct(id: string, updates: Partial<Product>): Product | null;
  deleteProduct(id: string): boolean;
  findProductsByName(name: string): Product[];
}
