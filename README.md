# POS System

A TypeScript-based Point of Sale system with support for products, promotions, and checkout functionality.

## Features

- **Product Management**: Add, update, delete, and search products (unit and weighted items)
- **Promotion Engine**: Support for multiple promotion types:
  - Buy N Get M Off (BOGO with percentage discounts)
  - N for $X (bulk pricing)
  - Weighted specials (for items sold by weight)
  - Markdowns (simple price reductions)
- **Checkout System**: Cart management with automatic promotion application
- **Validation**: Comprehensive input validation using Zod schemas

## Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build project
pnpm build
```

## Usage

```typescript
import { POSSystemFactory } from './src/factory';

const pos = POSSystemFactory.create();

// Add products
const soup = pos.products.add({
  name: 'Campbell Soup',
  price: 1.89,
  isWeighted: false,
  createdAt: new Date()
});

// Add promotions
pos.promotions.addPromotion({
  type: 'buyNgetMoff',
  productId: soup.id,
  validFrom: new Date(),
  validTo: new Date(Date.now() + 86400000),
  isActive: true,
  buyQuantity: 1,
  getQuantity: 1,
  discountPercent: 100 // Buy 1 Get 1 Free
});

// Checkout
pos.checkout.scan(soup.id);
pos.checkout.scan(soup.id);
console.log(pos.checkout.total()); // 1.89 (BOGO applied)
```

## Architecture

- **Core**: Types, validation, and utilities
- **Services**: Business logic for products, promotions, and checkout
- **Interfaces**: Service contracts
- **Factory**: System initialization and dependency injection

## Testing

The project includes comprehensive test coverage:
- Unit tests for all services
- Integration tests for complete workflows
- Validation tests for error handling
- Test fixtures for consistent test data
