import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Award, ShieldCheck, Heart } from 'lucide-react';
import restaurantData from '../../data/restaurant.json';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-maroon-dark)',
        color: '#FFFFFF',
        paddingTop: '64px',
        paddingBottom: '90px',
        borderTop: '4px solid var(--brand-red)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '44px',
            marginBottom: '44px',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src="/logo.png"
                alt="Annapurna's Rajubhai Dabeliwale Logo"
                style={{
                  width: 50,
                  height: 50,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  Annapurna’s Rajubhai
                </h3>
                <div style={{ color: 'var(--brand-yellow)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Taste The Real • Since 1987
                </div>
              </div>
            </div>
            <p
              style={{
                color: 'var(--brand-peach)',
                fontSize: '0.9rem',
                lineHeight: 1.65,
                marginBottom: '18px',
              }}
            >
              The authentic home of Kutch Dabeli, grilled sandwiches, and Mumbai street savories.
              Handcrafting real street food flavors since 1987.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255, 213, 79, 0.15)',
                border: '1px solid var(--brand-yellow)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--brand-yellow)',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Award size={15} />
              <span>Taste The Real • Since 1987</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: 'var(--brand-yellow)',
                fontSize: '0.98rem',
                fontWeight: 800,
                marginBottom: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--brand-peach)', transition: 'color 0.2s' }}>
                  Home & Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: 'var(--brand-peach)', transition: 'color 0.2s' }}>
                  Explore 7+ Dabelis & Chaat
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: 'var(--brand-peach)', transition: 'color 0.2s' }}>
                  Track Kitchen Token & Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" style={{ color: 'var(--brand-peach)', transition: 'color 0.2s' }}>
                  Customer Profile & Saved Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Quality Standards */}
          <div>
            <h4
              style={{
                color: 'var(--brand-yellow)',
                fontSize: '0.98rem',
                fontWeight: 800,
                marginBottom: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Our Assurance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--brand-peach)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="var(--brand-yellow)" />
                <span>100% Pure Vegetarian & Jain Options</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="var(--brand-yellow)" />
                <span>Cooked exclusively with Amul Butter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color="var(--brand-yellow)" />
                <span>Live Hot Preparation on Iron Tawas</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 4 }}>
                FSSAI Lic No: {restaurantData.fssai}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4
              style={{
                color: 'var(--brand-yellow)',
                fontSize: '0.98rem',
                fontWeight: 800,
                marginBottom: '18px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Store Location
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--brand-peach)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={18} color="var(--brand-yellow)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{restaurantData.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="var(--brand-yellow)" />
                <a href={`tel:${restaurantData.contactPhone}`} style={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {restaurantData.contactPhone}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color="var(--brand-yellow)" />
                <span>{restaurantData.operatingHoursDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 216, 180, 0.2)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.84rem',
            color: 'var(--brand-peach)',
            gap: 16,
          }}
        >
          <div>
            © {new Date().getFullYear()} Annapurna’s Rajubhai Dabeliwale. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Crafted with</span>
            <Heart size={14} fill="var(--brand-red)" color="var(--brand-red)" />
            <span>for authentic street food lovers. Integrated with POS Engine.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
