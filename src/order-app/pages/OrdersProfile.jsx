import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Clock,
  RotateCcw,
  LogOut,
  Plus,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getUserOrders } from '../services/api';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const OrdersProfile = () => {
  const { user, logout, addSavedAddress } = useAuth();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newAddressLandmark, setNewAddressLandmark] = useState('');
  const [addressTag, setAddressTag] = useState('Home');

  useEffect(() => {
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const fetched = await getUserOrders(user?.phone);
        setOrders(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart(item, item.quantity, item.selectedSize, item.selectedAddons, item.instructions);
    });
    addToast('Items added to cart from past order!', 'success');
    setIsCartDrawerOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;

    addSavedAddress({
      tag: addressTag,
      line1: newAddressLine,
      landmark: newAddressLandmark,
      city: 'Bhuj',
    });

    setNewAddressLine('');
    setNewAddressLandmark('');
    setShowAddressModal(false);
    addToast('Address saved successfully!', 'success');
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out safely', 'info');
    navigate('/');
  };

  return (
    <div className="page-shell">
      {/* Profile Header card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: 'var(--brand-yellow)',
              border: '2px solid var(--brand-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-red)',
            }}
          >
            <User size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--brand-maroon)', margin: 0, fontWeight: 900 }}>
              {user?.name || 'Valued Foodie Customer'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
              <Phone size={14} color="var(--brand-orange)" />
              <span>{user?.phone ? `+91 ${user.phone}` : 'Guest Session'}</span>
            </div>
          </div>
        </div>

        {user && (
          <button onClick={handleLogout} className="btn-brand-outline" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          borderBottom: '2px solid var(--border-subtle)',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 22px',
            fontWeight: 800,
            fontSize: '0.98rem',
            color: activeTab === 'orders' ? 'var(--brand-red)' : 'var(--brand-maroon)',
            borderBottom: activeTab === 'orders' ? '3px solid var(--brand-red)' : 'none',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
          }}
        >
          My Orders & History ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '12px 22px',
            fontWeight: 800,
            fontSize: '0.98rem',
            color: activeTab === 'addresses' ? 'var(--brand-red)' : 'var(--brand-maroon)',
            borderBottom: activeTab === 'addresses' ? '3px solid var(--brand-red)' : 'none',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
          }}
        >
          Saved Delivery Addresses
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={44} color="var(--brand-red)" />}
              title="No Past Orders Yet"
              description="Taste the legendary flavors of Annapurna's Rajubhai Dabeliwale today!"
              actionText="Order Fresh Food Now"
              onAction={() => navigate('/menu')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '12px',
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--brand-maroon)' }}>
                        Order #{ord.orderId}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Placed on {new Date(ord.timestamps?.placedAt || Date.now()).toLocaleDateString()} at{' '}
                        {new Date(ord.timestamps?.placedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          backgroundColor: ord.status === 'Delivered' ? '#2e7d32' : 'var(--brand-orange)',
                          color: '#FFFFFF',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {ord.status}
                      </span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--brand-red)' }}>
                        ₹{ord.totals?.grandTotal}
                      </strong>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ fontSize: '0.92rem', color: 'var(--brand-maroon)' }}>
                    {ord.items?.map((it, idx) => (
                      <div key={idx} style={{ display: 'inline-block', marginRight: '16px', marginBottom: '4px' }}>
                        • {it.quantity}x {it.name}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      paddingTop: '6px',
                    }}
                  >
                    <Link to={`/order-status/${ord.orderId}`}>
                      <button className="btn-brand-outline" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                        View Bill & Track
                      </button>
                    </Link>
                    <button
                      className="btn-brand-primary"
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                      onClick={() => handleReorder(ord)}
                    >
                      <RotateCcw size={14} />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-maroon)', margin: 0, fontWeight: 800 }}>
              Your Saved Delivery Addresses
            </h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="btn-brand-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Plus size={16} />
              <span>Add Address</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    border: '1.5px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={18} color="var(--brand-red)" />
                    <strong style={{ color: 'var(--brand-maroon)', fontSize: '0.98rem' }}>
                      {addr.tag || 'Address'}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', margin: 0 }}>
                    {addr.line1}
                  </p>
                  {addr.landmark && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Landmark: {addr.landmark}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  backgroundColor: 'var(--bg-soft)',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--brand-maroon)',
                }}
              >
                No saved addresses found. Addresses entered during checkout will automatically appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--brand-maroon)', display: 'block', marginBottom: 6 }}>
              Address Tag
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Home', 'Office', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAddressTag(t)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    backgroundColor: addressTag === t ? 'var(--brand-red)' : 'var(--bg-soft)',
                    color: addressTag === t ? '#FFFFFF' : 'var(--brand-maroon)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Street Address / Flat / Building *"
            placeholder="Flat 204, Swaminarayan Heights..."
            value={newAddressLine}
            onChange={(e) => setNewAddressLine(e.target.value)}
            required
          />

          <Input
            label="Landmark (Optional)"
            placeholder="Near Jubilee Ground"
            value={newAddressLandmark}
            onChange={(e) => setNewAddressLandmark(e.target.value)}
          />

          <button type="submit" className="btn-brand-primary" style={{ width: '100%', marginTop: 10 }}>
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
};
