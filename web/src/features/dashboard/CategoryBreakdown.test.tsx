import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBreakdown } from './CategoryBreakdown';

describe('CategoryBreakdown', () => {
  it('renders each category with its share of the total', () => {
    render(
      <CategoryBreakdown
        total={200}
        items={[
          { categoryId: 1, name: 'Bills', color: '#ef4444', total: 150, count: 2 },
          { categoryId: 2, name: 'Food', color: '#f97316', total: 50, count: 3 },
        ]}
      />,
    );
    expect(screen.getByRole('meter', { name: 'Bills' })).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('$50.00 · 25%')).toBeInTheDocument();
  });
});
