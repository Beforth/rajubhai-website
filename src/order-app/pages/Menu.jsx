import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, X } from 'lucide-react';
import { getMenu, getCategories } from '../services/api';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { ItemDetailsModal } from '../components/menu/ItemDetailsModal';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';

export const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, items] = await Promise.all([getCategories(), getMenu()]);
        setCategories(cats);
        setMenuItems(items);
      } catch (err) {
        console.error('Failed to load menu data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tagline && item.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBestseller = bestsellerOnly ? item.isBestseller : true;

    return matchesCategory && matchesSearch && matchesBestseller;
  });

  return (
    <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header & Search Control Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', color: 'var(--brand-maroon)', letterSpacing: '-0.8px', margin: 0 }}>
            Annapurna's Street Menu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: 4 }}>
            Original Kutch Dabeli, Mumbai Chaat, and grilled sandwiches prepared fresh on order.
          </p>
        </div>

        {/* Search input with sleek pill design */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', maxWidth: '520px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Search size={18} color="var(--brand-orange)" />
            <input
              type="text"
              placeholder="Search dabeli, sev puri, chaat, sandwich..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.92rem',
                color: 'var(--text-dark)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Bestseller toggle */}
          <button
            onClick={() => setBestsellerOnly(!bestsellerOnly)}
            style={{
              backgroundColor: bestsellerOnly ? 'var(--brand-yellow)' : '#FFFFFF',
              color: 'var(--brand-maroon)',
              border: '1.5px solid var(--border-subtle)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} color="var(--brand-red)" />
            <span>Bestsellers</span>
          </button>
        </div>
      </div>

      {/* Sticky Category Navigator */}
      <div
        style={{
          position: 'sticky',
          top: 78,
          zIndex: 850,
          backgroundColor: 'rgba(255, 251, 247, 0.96)',
          backdropFilter: 'blur(8px)',
          paddingTop: 8,
          paddingBottom: 8,
          margin: '-8px 0',
        }}
      >
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <Loader text="Loading fresh dishes..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No food dishes found"
          description={`No items match "${searchQuery || activeCategory}". Try searching for 'Dabeli' or 'Chaat'.`}
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setActiveCategory('all');
            setBestsellerOnly(false);
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelectCustomization={(it) => setSelectedItemForModal(it)}
            />
          ))}
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <ItemDetailsModal
          item={selectedItemForModal}
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
        />
      )}
    </div>
  );
};
