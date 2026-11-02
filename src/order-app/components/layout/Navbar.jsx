import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, Menu as MenuIcon, X, Sparkles, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import restaurantData from '../../data/restaurant.json';

export const Navbar = () => {
  const { itemCount, grandTotal, setIsCartDrawerOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid rgba(229, 26, 27, 0.15)',
        boxShadow: '0 4px 18px rgba(133, 58, 48, 0.06)',
      }}
    >
      {/* Top Brand Notification Bar */}
      <div
        style={{
          backgroundColor: 'var(--brand-maroon)',
          color: '#FFFFFF',
          padding: '6px 0',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                backgroundColor: 'var(--brand-yellow)',
                color: 'var(--brand-maroon)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
            >
              Since 1987
            </span>
            <span style={{ opacity: 0.95 }}>
              Live Tawa Kitchen Open • {restaurantData.operatingHoursDisplay}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ opacity: 0.85, fontSize: '0.78rem' }}>
              FSSAI Lic: {restaurantData.fssai}
            </span>
            <a
              href={`tel:${restaurantData.contactPhone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'var(--brand-yellow)',
                fontWeight: 700,
              }}
            >
              <Phone size={13} />
              <span>{restaurantData.contactPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          height: '78px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Tagline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="Annapurna's Rajubhai Dabeliwale Logo"
            style={{
              width: 52,
              height: 52,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />

          <div>
            <div
              style={{
                fontSize: '1.28rem',
                fontWeight: 900,
                color: 'var(--brand-red)',
                lineHeight: 1.15,
                letterSpacing: '-0.4px',
              }}
            >
              Annapurna’s Rajubhai
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--brand-maroon)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Dabeliwale • <span style={{ color: 'var(--brand-orange)', fontStyle: 'italic', textTransform: 'none', fontWeight: 700 }}>Taste The Real</span>
            </div>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-soft)',
            padding: '5px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
          className="desktop-nav-menu"
        >
          <NavLink
            to="/"
            style={({ isActive }) => ({
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: isActive ? '#FFFFFF' : 'var(--brand-maroon)',
              backgroundColor: isActive ? 'var(--brand-red)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            style={({ isActive }) => ({
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: isActive ? '#FFFFFF' : 'var(--brand-maroon)',
              backgroundColor: isActive ? 'var(--brand-red)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            Order Menu
          </NavLink>
          <NavLink
            to="/orders"
            style={({ isActive }) => ({
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: isActive ? '#FFFFFF' : 'var(--brand-maroon)',
              backgroundColor: isActive ? 'var(--brand-red)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            Track Order
          </NavLink>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--bg-soft)',
                color: 'var(--brand-maroon)',
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <User size={16} color="var(--brand-red)" />
              <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'transparent',
                color: 'var(--brand-maroon)',
                border: '1.5px solid var(--brand-maroon)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              <User size={16} />
              <span>Login</span>
            </Link>
          )}

          {/* High-visibility Cart Trigger Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            style={{
              backgroundColor: 'var(--brand-red)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 800,
              fontSize: '0.92rem',
              boxShadow: '0 4px 14px rgba(229, 26, 27, 0.35)',
              transition: 'all 0.2s ease',
            }}
            aria-label="View Cart"
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px',
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-maroon)',
              padding: 6,
            }}
            className="mobile-hamburger-btn"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-maroon)', padding: '6px 0' }}
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-maroon)', padding: '6px 0' }}
          >
            Full Menu & Order
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-maroon)', padding: '6px 0' }}
          >
            Track Active Order
          </Link>
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-red)', padding: '6px 0' }}
          >
            {isAuthenticated ? 'My Profile & Addresses' : 'Login / Register'}
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav-menu { display: flex !important; }
          .mobile-hamburger-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
