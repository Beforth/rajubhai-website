import { useCallback } from 'react';
import { useOutlet } from '../context/OutletContext';
import { useCart } from '../context/CartContext';

// Changes the outlet; if the cart has items (they belong to the current outlet) it asks first.
export function useSwitchOutlet() {
  const { outletId, setOutletId } = useOutlet();
  const { cartItems, clearCart } = useCart();
  return useCallback(
    (id) => {
      if (id === outletId) return true;
      if (outletId && cartItems.length > 0) {
        const ok = window.confirm('Your cart has items from another outlet. Switching will clear your cart. Continue?');
        if (!ok) return false;
        clearCart();
      }
      setOutletId(id);
      return true;
    },
    [outletId, cartItems.length, clearCart, setOutletId]
  );
}
