import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { PriceSummary } from './PriceSummary';
import { CheckoutNotice } from './CheckoutNotice';
import { formatMoney } from '../../services/money';

// In-page cart for wide screens. Hidden by CSS below 1280px, where the drawer is used instead.
export const CartPanel = () => {
  const { cartItems, itemCount, grandTotal, checkout } = useCart();
  const navigate = useNavigate();

  return (
    <aside data-cart-panel className="order-cart" aria-label="Your cart">
      <div className="order-cart-head">
        <ShoppingBag size={18} color="var(--brand-red)" />
        <span>Your Cart</span>
        {itemCount > 0 && <span className="order-cart-badge">{itemCount}</span>}
      </div>

      {cartItems.length === 0 ? (
        <div className="order-cart-empty">
          <ShoppingBag size={40} color="var(--brand-peach)" />
          <p>Your cart is empty</p>
          <small>Pick a dish from the menu and it will show up here.</small>
        </div>
      ) : (
        <>
          <div className="order-cart-scroll">
            {cartItems.map((item) => (
              <CartItem key={item.cartKey} item={item} />
            ))}
            <div className="order-cart-bill">
              <PriceSummary compact />
            </div>
          </div>
          <div className="order-cart-foot">
            <div>
              <span>Total to pay</span>
              <strong>{grandTotal ? formatMoney(grandTotal) : '…'}</strong>
            </div>
            <button
              type="button"
              className="btn-brand-primary"
              disabled={!checkout.canCheckout}
              onClick={() => navigate('/checkout')}
            >
              <span>Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
          <CheckoutNotice />
        </>
      )}
    </aside>
  );
};
