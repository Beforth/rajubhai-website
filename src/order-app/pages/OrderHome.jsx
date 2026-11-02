import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Tag } from 'lucide-react';
import { getMenu, getCategories } from '../services/api';
import coupons from '../data/coupons.json';
import { CategorySidebar } from '../components/menu/CategorySidebar';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { ItemDetailsModal } from '../components/menu/ItemDetailsModal';
import { CartPanel } from '../components/cart/CartPanel';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';

const offerLabel = (c) => (c.discountPercent ? `${c.discountPercent}% off` : `₹${c.discountFlat} off`);

export const OrderHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  useEffect(() => {
    Promise.all([getCategories(), getMenu()])
      .then(([cats, items]) => {
        setCategories(cats);
        setMenuItems(items);
      })
      .catch((err) => console.error('Failed to load menu data', err))
      .finally(() => setLoading(false));
  }, []);

  const requested = searchParams.get('category');
  const activeCategory = categories.some((c) => c.id === requested) ? requested : categories[0]?.id;
  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  const counts = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      map[item.categoryId] = (map[item.categoryId] || 0) + 1;
    });
    return map;
  }, [menuItems]);

  const selectCategory = (id) => {
    setSearchQuery('');
    setSearchParams({ category: id }, { replace: true });
  };

  const query = searchQuery.trim().toLowerCase();
  const visibleItems = menuItems.filter((item) => {
    if (query) {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.tagline && item.tagline.toLowerCase().includes(query))
      );
    }
    return item.categoryId === activeCategory;
  });

  return (
    <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', letterSpacing: '-0.6px', margin: 0 }}>Order Online</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 4 }}>
            Pick a category, add your dishes, and check out. Cooked fresh on order.
          </p>
        </div>
        <div className="order-search">
          <Search size={18} color="var(--brand-orange)" />
          <input
            type="text"
            placeholder="Search dabeli, chaat, sandwich..."
            aria-label="Search the menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="order-offers hide-scrollbar" aria-label="Offers">
        <Tag size={15} color="var(--brand-red)" />
        {coupons.map((c) => (
          <span key={c.code} className="order-offer" title={c.description}>
            <b>{c.code}</b> {offerLabel(c)}
          </span>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading fresh dishes..." />
      ) : (
        <div className="order-layout">
          <CategorySidebar
            categories={categories}
            counts={counts}
            activeCategory={query ? null : activeCategory}
            onSelectCategory={selectCategory}
          />

          <section aria-live="polite">
            <h2 style={{ fontSize: '1.3rem', marginBottom: 14 }}>
              {query ? `Results for “${searchQuery.trim()}”` : activeCategoryData?.name}
              <span style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '0.9rem', marginLeft: 10 }}>
                {visibleItems.length} items
              </span>
            </h2>
            {visibleItems.length === 0 ? (
              <EmptyState
                title="No dishes found"
                description="Try another word, or pick a category."
                actionText="Clear search"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <div className="order-items">
                {visibleItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onSelectCustomization={setSelectedItemForModal} />
                ))}
              </div>
            )}
          </section>

          <CartPanel />
        </div>
      )}

      {selectedItemForModal && (
        <ItemDetailsModal item={selectedItemForModal} isOpen onClose={() => setSelectedItemForModal(null)} />
      )}
    </div>
  );
};
