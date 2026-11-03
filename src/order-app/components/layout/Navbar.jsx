import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, Menu as MenuIcon, X, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOutlet } from '../../context/OutletContext';
import { formatMoney } from '../../services/money';

export const Navbar = () => {
  const { itemCount, grandTotal, setIsCartDrawerOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { info } = useOutlet();
  const phone = info?.phone || '';
  const hours = info?.hours || '';

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: 'rgba(251, 246, 239, 0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1.5px solid var(--border-subtle)',
        boxShadow: '0 2px 12px rgba(43, 23, 18, 0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand & Home Return */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/"
            aria-label="Back to Rajubhai Dabeliwale Home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: 'var(--text-dark)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '2px solid var(--text-dark)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <img
                src="/logo.png"
                alt="Rajubhai Dabeliwale"
                width="44"
                height="44"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  lineHeight: 1.15,
                  color: 'var(--text-dark)',
                  letterSpacing: '-0.3px',
                }}
              >
                Rajubhai Dabeliwale
              </div>
              <div
                className="brand-subtitle"
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Est. 1987 · Nashik</span>
                {info && (
                  <>
                    <span style={{ color: 'var(--brand-red)' }}>•</span>
                    <span style={{ color: info.accepting_orders ? '#2e7d32' : 'var(--brand-red)' }}>
                      {info.accepting_orders ? hours || 'Open' : 'Closed'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </a>

          <a
            href="/"
            className="home-return-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
              marginLeft: '8px',
            }}
          >
            <ArrowLeft size={13} />
            <span>Main Site</span>
          </a>
        </div>

        {/* Center Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-soft)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
          className="desktop-nav-menu"
          aria-label="Order navigation"
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: '7px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isActive ? 'var(--text-white)' : 'var(--text-dark)',
              backgroundColor: isActive ? 'var(--brand-red)' : 'transparent',
              transition: 'all 0.18s ease',
            })}
          >
            Order Menu
          </NavLink>
          <NavLink
            to="/orders"
            style={({ isActive }) => ({
              padding: '7px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isActive ? 'var(--text-white)' : 'var(--text-dark)',
              backgroundColor: isActive ? 'var(--brand-red)' : 'transparent',
              transition: 'all 0.18s ease',
            })}
          >
            Track Order
          </NavLink>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {phone && (
          <a
            href={`tel:${phone}`}
            className="call-kitchen-btn"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--brand-maroon)',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
            title="Call Kitchen Directly"
          >
            <Phone size={14} color="var(--brand-red)" />
            <span>{phone}</span>
          </a>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="user-nav-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--bg-soft)',
                color: 'var(--text-dark)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <User size={15} color="var(--brand-red)" />
              <span className="user-name-text">{user?.name?.split(' ')[0] || 'Profile'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="user-nav-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'transparent',
                color: 'var(--text-dark)',
                border: '1px solid var(--border-subtle)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} />
              <span className="user-name-text">Login</span>
            </Link>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            style={{
              backgroundColor: 'var(--brand-red)',
              color: 'var(--text-white)',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 800,
              fontSize: '0.84rem',
              boxShadow: '0 3px 10px rgba(255, 9, 23, 0.28)',
              transition: 'all 0.18s ease',
            }}
            aria-label={`View Cart, ${itemCount} items`}
          >
            <ShoppingBag size={15} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 6px',
                }}
              >
                {itemCount}
              </span>
            )}
            {itemCount > 0 && (
              <span className="cart-total-pill-text" style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.95 }}>
                {grandTotal ? `• ${formatMoney(grandTotal)}` : ''}
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
              color: 'var(--text-dark)',
              padding: 6,
              borderRadius: '8px',
            }}
            className="mobile-hamburger-btn"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text-dark)',
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Main Website</span>
          </a>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-maroon)', padding: '6px 0' }}
          >
            Order Menu
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-maroon)', padding: '6px 0' }}
          >
            Track Active Order
          </Link>
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-red)', padding: '6px 0' }}
          >
            {isAuthenticated ? 'My Profile & Addresses' : 'Login / Register'}
          </Link>
          <div
            style={{
              paddingTop: 8,
              marginTop: 4,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {hours && <div>Kitchen Open: {hours}</div>}
            {phone && (
              <a
                href={`tel:${phone}`}
                style={{ color: 'var(--brand-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Phone size={13} />
                <span>Call: {phone}</span>
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav-menu { display: flex !important; }
          .call-kitchen-btn { display: flex !important; }
          .mobile-hamburger-btn { display: none !important; }
        }
        @media (max-width: 600px) {
          .home-return-link { display: none !important; }
          .brand-subtitle { display: none !important; }
          .user-name-text { display: none !important; }
          .user-nav-link { padding: 7px !important; }
        }
        @media (max-width: 380px) {
          .cart-total-pill-text { display: none !important; }
        }
      `}</style>
    </header>
  );
};