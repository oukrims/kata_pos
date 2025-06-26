import { describe, it, expect } from 'vitest';
import {generateId} from '../core/utils/id-generator'
import { validateProduct} from '../core/utils/validation'
import {InvalidProductDataFixture} from "./fixtures/product.fixture.ts"
import { ValidationError } from '../core/errors';

describe("utils test", () => {
  describe("random id generator",() => {
    it("should create a random id", ()=> {
      const id = generateId(10)
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(9)
    })
  })


  describe("validaiton tests", () => {
    it("should throw ValidationError for empty name and negative price", () => {
      expect(() => validateProduct(InvalidProductDataFixture)).toThrow(ValidationError);
    })
  })
})
