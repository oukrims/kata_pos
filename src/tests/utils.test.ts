import { describe, it, expect } from 'vitest';
import {generateId} from '../core/utils/id-generator'
describe("utils test", () => {
  describe("random id generator",() => {
    it("should fail to create a random id", ()=> {
      const id = generateId()
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(id.length).toBeLessThan(1)
    })
  })
})
