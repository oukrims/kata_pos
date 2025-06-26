export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt?: Date;
}
export interface TimestampedEntity extends BaseEntity {
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
}

