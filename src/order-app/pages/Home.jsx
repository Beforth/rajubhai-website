import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  ChevronRight,
  Award,
  Percent,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { getMenu, getCategories } from '../services/api';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { ItemDetailsModal } from '../components/menu/ItemDetailsModal';
import couponsData from '../data/coupons.json';
import restaurantData from '../data/restaurant.json';

export const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const [items, cats] = await Promise.all([getMenu(), getCategories()]);
      setBestsellers(items.filter((item) => item.isBestseller));
      setCategories(cats);
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
      {/* 1. Hero Section with mouthwatering Dabeli imagery */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          padding: 'clamp(28px, 4vw, 56px)',
          background: 'linear-gradient(135deg, #FFFFFF 60%, var(--bg-soft) 100%)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Left Hero Text Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={14} color="var(--brand-red)" />
                KUTCH SPECIALTY SINCE 1987
              </span>

              <span
                style={{
                  color: '#2e7d32',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span className="veg-stamp">
                  <span className="veg-stamp-dot" />
                </span>
                100% Pure Veg & Jain Options
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
                fontWeight: 900,
                color: 'var(--brand-maroon)',
                lineHeight: 1.12,
                letterSpacing: '-1px',
                margin: 0,
              }}
            >
              Taste The Real <br />
              <span style={{ color: 'var(--brand-red)' }}>Original Kutch Dabeli.</span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Fresh toasted pav griddled in pure Amul butter, packed with our legendary 16-spice masala potato filling,
              crunchy masala sing, sweet date chutney, and fresh ruby pomegranates. Cooked live on iron tawas!
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <button
                onClick={() => navigate('/menu')}
                className="btn-brand-primary"
                style={{ padding: '15px 32px', fontSize: '1.05rem' }}
              >
                <span>Order Now Online</span>
                <ArrowRight size={19} />
              </button>

              <button
                onClick={() => navigate('/menu?category=dabeli')}
                className="btn-brand-outline"
                style={{ padding: '13px 26px', fontSize: '1rem' }}
              >
                <span>Explore 7+ Dabelis</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--brand-maroon)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={18} color="var(--brand-red)" />
                <span>25-30 Mins Hot Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={18} color="var(--brand-orange)" />
                <span>4.9★ Rated (5,000+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* Right Hero High-Quality Dabeli Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 12',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid #FFFFFF',
              }}
            >
              <img
                src="/dabeli-hero.png"
                alt="Delicious Original Rajubhai Dabeli Loaded with Masala Peanuts and Sev"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Offers & Promo Code Strip */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
        }}
      >
        {couponsData.map((c) => (
          <div
            key={c.code}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              border: '1.5px dashed var(--brand-red)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-yellow)',
                    color: 'var(--brand-maroon)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {c.code}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700 }}>
                  VALID TODAY
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--brand-maroon)', fontWeight: 600 }}>
                {c.description}
              </div>
            </div>

            <button
              onClick={() => navigate('/menu')}
              style={{
                color: 'var(--brand-red)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}
            >
              <span>Use</span>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </section>

      {/* 3. Explore Categories Section (With attractive Chaat & Dabeli cards) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Authentic Indian Street Flavours
            </div>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--brand-maroon)', letterSpacing: '-0.5px', margin: 0 }}>
              Explore Categories
            </h2>
          </div>

          <Link
            to="/menu"
            style={{
              color: 'var(--brand-maroon)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>View Full Menu</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Categories Cards Grid with food imagery */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '18px',
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/menu?category=${cat.id}`)}
              className="category-card-interactive"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'var(--brand-yellow)',
                    color: 'var(--brand-maroon)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {cat.count} Items
                </span>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontSize: '1.02rem', color: 'var(--brand-maroon)' }}>
                  {cat.name}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cat.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Crowd Favorites & Bestsellers (Dabeli & Chaat Focus) */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Most Loved By Gujarat
            </div>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--brand-maroon)', letterSpacing: '-0.5px', margin: 0 }}>
              Crowd Favorites & Bestsellers
            </h2>
          </div>

          <Link
            to="/menu"
            style={{
              color: 'var(--brand-red)',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>See All Dishes</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Responsive Grid with equal card spacing */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px',
          }}
        >
          {bestsellers.slice(0, 8).map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelectCustomization={(it) => setSelectedItemForModal(it)}
            />
          ))}
        </div>
      </section>

      {/* 5. Heritage & 1987 Story Card */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(28px, 4vw, 52px)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--brand-red)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Since 1987 • The Original Taste
          </span>
          <h2 style={{ fontSize: '2.1rem', color: 'var(--brand-maroon)', marginBottom: '16px', letterSpacing: '-0.6px' }}>
            39+ Years of Culinary Perfection
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: '14px' }}>
            In 1987, Raju Bhai started in Mandvi with a burning passion: to serve the authentic taste of
            Kutch Dabeli made without compromises. Over three and a half decades later, Annapurna's Rajubhai Dabeliwale
            remains the gold standard for taste, purity, and hygiene.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: '24px' }}>
            We still roast and blend our secret 16 spices in-house, toast our buns in pure Amul butter, and
            prepare fresh sweet date-tamarind and spicy garlic chutneys daily.
          </p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ fontSize: '1.7rem', color: 'var(--brand-red)', fontWeight: 900, display: 'block' }}>
                39+
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--brand-maroon)', fontWeight: 600 }}>Years of Heritage</span>
            </div>
            <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: '24px' }}>
              <strong style={{ fontSize: '1.7rem', color: 'var(--brand-maroon)', fontWeight: 900, display: 'block' }}>
                100%
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--brand-maroon)', fontWeight: 600 }}>Pure Vegetarian & Jain</span>
            </div>
            <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: '24px' }}>
              <strong style={{ fontSize: '1.7rem', color: 'var(--brand-orange)', fontWeight: 900, display: 'block' }}>
                1M+
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--brand-maroon)', fontWeight: 600 }}>Satisfied Customers</span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            height: '350px',
            boxShadow: 'var(--shadow-md)',
            border: '4px solid #FFFFFF',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80"
            alt="Famous Rajubhai Cheese Blast Dabeli"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Customization modal */}
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
