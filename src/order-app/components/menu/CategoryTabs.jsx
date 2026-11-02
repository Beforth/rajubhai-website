import React from 'react';
import { Flame, Sandwich, Sparkles, Layers, Coffee, Heart, Utensils } from 'lucide-react';

const ICON_MAP = {
  Flame,
  Sandwich,
  Sparkles,
  Layers,
  Coffee,
  Heart,
};

export const CategoryTabs = ({
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        paddingTop: '4px',
        WebkitOverflowScrolling: 'touch',
      }}
      className="hide-scrollbar"
    >
      <button
        onClick={() => onSelectCategory('all')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 18px',
          borderRadius: 'var(--radius-full)',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          fontSize: '0.88rem',
          transition: 'all 0.2s ease',
          backgroundColor: activeCategory === 'all' ? 'var(--text-primary)' : '#FFFFFF',
          color: activeCategory === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
          border: activeCategory === 'all' ? '1px solid var(--text-primary)' : '1px solid var(--border-light)',
          boxShadow: activeCategory === 'all' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <Utensils size={15} />
        <span>All Dishes</span>
      </button>

      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Sparkles;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              backgroundColor: isActive ? 'var(--text-primary)' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-light)',
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <IconComponent size={15} color={isActive ? '#FFFFFF' : 'var(--orange)'} />
            <span>{cat.name}</span>
            <span
              style={{
                fontSize: '0.74rem',
                opacity: 0.8,
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
