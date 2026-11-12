import type { Category } from '@/lib/types';

export function CategoryBadge({ category }: { category: Pick<Category, 'name' | 'color'> | null }) {
  if (!category) return <span className="badge">Uncategorised</span>;
  return (
    <span className="badge">
      <span className="badge__dot" style={{ backgroundColor: category.color }} aria-hidden />
      {category.name}
    </span>
  );
}
