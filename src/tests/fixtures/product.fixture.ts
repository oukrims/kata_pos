import {Product}  from "../../core/types"

export const InvalidProductDataFixture: Omit<Product, "id"> = {
  name: "",
  price: -1,
  isWeighted: false,
  createdAt: new Date()
}
