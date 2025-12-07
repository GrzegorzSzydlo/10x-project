# Testing Setup

This project uses Vitest for unit testing and Playwright for E2E testing.

## Unit Tests (Vitest)

### Running Unit Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Test files should be placed next to the code they test in `__tests__` directories
- Test files should use `.test.ts` or `.spec.ts` extension
- Use `describe` blocks to group related tests
- Follow the Arrange-Act-Assert pattern

### Example Test

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { name: 'Test' };

    // Act
    const result = render(<MyComponent {...props} />);

    // Assert
    expect(result).toBeDefined();
  });
});
```

## E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate test code
npm run test:e2e:codegen
```

### Test Structure

- E2E test files should be placed in the `e2e` directory
- Test files should use `.spec.ts` extension
- Use Page Object Model for maintainable tests
- Use descriptive test names

### Example E2E Test

```typescript
import { test, expect } from "@playwright/test";

test("should navigate to login page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /log in/i }).click();
  await expect(page).toHaveURL(/.*login/);
});
```

## Best Practices

### Unit Tests

- Use mocks and spies for external dependencies
- Test one thing at a time
- Use descriptive test names
- Keep tests isolated and independent
- Use setup files for common configuration

### E2E Tests

- Use Page Object Model for complex pages
- Use data-testid attributes for stable selectors
- Test user flows, not implementation details
- Use fixtures for authentication and setup
- Keep tests independent

## Configuration

### Vitest Configuration

- Located in `vitest.config.ts`
- Configured for React and jsdom environment
- Coverage reports in `coverage` directory

### Playwright Configuration

- Located in `playwright.config.ts`
- Configured for Chromium browser
- HTML reports in `playwright-report` directory
- Traces available for debugging failed tests
