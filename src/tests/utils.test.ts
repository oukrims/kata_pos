import { describe, it, expect } from 'vitest';
import {generateId} from '../core/utils/id-generator'

describe("utils test", () => {
  describe("random id generator",() => {
    it("should create a random id", ()=> {
      const id = generateId()
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(7)
    })
  })
})
