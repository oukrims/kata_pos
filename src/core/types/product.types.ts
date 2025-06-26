import { BaseEntity } from './common.types';

export interface Product extends BaseEntity {
  name: string;
  price: number;
  isWeighted: boolean;
}
