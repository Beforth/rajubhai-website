import React, { useEffect, useRef } from 'react';
import { UtensilsCrossed, LayoutGrid } from 'lucide-react';

export const CategorySidebar = ({
  categories = [],
  counts = {},
  totalCount = 0,
  activeCategory,
  onSelectCategory,
}) => {
  const listRef = useRef(null);

  // In the horizontal (mobile) strip, keep the selected item in view smoothly
  useEffect(() => {
    const list = listRef.current;
    const activeEl = list?.querySelector('.is-active');
    if (!list || !activeEl || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = activeEl.offsetLeft - (list.clientWidth - activeEl.offsetWidth) / 2;
  }, [activeCategory, categories]);

  return (
    <aside className="order-categories-board" aria-label="Menu categories">
      <div className="categories-board-head">
        <span>Menu Categories</span>
        <span className="cat-total-badge">{totalCount} items</span>
      </div>

      <nav ref={listRef} className="categories-list hide-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          aria-current={activeCategory === 'all' ? 'true' : undefined}
          className={`cat-row${activeCategory === 'all' ? ' is-active' : ''}`}
        >
          <span className="cat-row-name">All Items</span>
          <span className="cat-row-count">{totalCount}</span>
        </button>

        {categories.map((cat) => {
          const active = cat.id === activeCategory;
          const count = counts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-current={active ? 'true' : undefined}
              className={`cat-row${active ? ' is-active' : ''}`}
            >
              <span className="cat-row-name">{cat.name}</span>
              <span className="cat-row-count">{count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};