import React, { useEffect, useRef } from 'react';

export const CategorySidebar = ({ categories = [], counts = {}, activeCategory, onSelectCategory }) => {
  const listRef = useRef(null);

  // In the horizontal (mobile) strip, keep the selected pill in view without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const pill = list?.querySelector('[aria-current="true"]');
    if (!list || !pill || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2;
  }, [activeCategory, categories]);

  return (
  <nav ref={listRef} className="cat-list hide-scrollbar" aria-label="Menu categories">
    {categories.map((cat) => {
      const active = cat.id === activeCategory;
      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          aria-current={active ? 'true' : undefined}
          className={`cat-pill${active ? ' is-active' : ''}`}
        >
          <img src={cat.image} alt="" className="cat-thumb" loading="lazy" />
          <span>
            <span className="cat-name">{cat.name}</span>
            <span className="cat-count">{counts[cat.id] ?? 0} items</span>
          </span>
        </button>
      );
    })}
  </nav>
  );
};
