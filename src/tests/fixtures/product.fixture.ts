import {Product}  from "../../core/types"
import {faker} from "@faker-js/faker"

export const  ProductFixture: Omit<Product, "id"> = {
  name: faker.commerce.productName(),
  price: parseInt(faker.commerce.price({
    min: 100,
    max: 1000,
    dec: 0
  })),
  isWeighted: false,
  createdAt: new Date()
}

export const InvalidProductDataFixture: Omit<Product, "id"> = {
  name: "",
  price: -1,
  isWeighted: false,
  createdAt: new Date()
}

export const  ProductVariantFixture: Omit<Product, "id"> = {
  name: faker.commerce.productName(),
  price: parseInt(faker.commerce.price({
    min: 100,
    max: 1000,
    dec: 0
  })),
  isWeighted: false,
  createdAt: new Date()
}

export const ProductVariant2Fixture: Omit<Product, "id"> = {
  name: ProductFixture.name + " variant",
  price: parseInt(faker.commerce.price({
    min: 100,
    max: 1000,
    dec: 0
  })),
  isWeighted: false,
  createdAt: new Date()
}

export const  EmptyNameProductFixture: Omit<Product, "id"> = {
  name: "",
  price: parseInt(faker.commerce.price({
    min: 100,
    max: 1000,
    dec: 0
  })),
  isWeighted: false,
  createdAt: new Date()
}


export const  NegativePriceProductFixture: Omit<Product, "id"> = {
  name: faker.commerce.productName(),
  price: -1,
  isWeighted: false,
  createdAt: new Date()
}


export const  WeightedProductFixture: Omit<Product, "id"> = {
  name: faker.commerce.productName(),
  price: parseInt(faker.commerce.price({
    min: 100,
    max: 1000,
    dec: 0
  })),
  isWeighted: true,
  createdAt: new Date()
}
