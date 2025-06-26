import { describe, it, expect } from 'vitest';
import {generateId} from '../core/utils/id-generator'
import { validateProduct} from '../core/utils/validation'
import { Product } from '../core/types'

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
    it("should validate product", () => {
      const product: Product = {
        name: "test product",
        price: 100,
        isWeighted: false
      }
      validateProduct(product)

    })
  })
})
