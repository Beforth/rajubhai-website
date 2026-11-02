import React, { createContext, useContext, useState, useEffect } from 'react';
import restaurantData from '../data/restaurant.json';

const CartContext = createContext();

const CART_STORAGE_KEY = 'rajubhai_user_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Cleanse and sanitize any legacy invalid items with NaN or missing values
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.unitPrice) || Number(item.price) || Number(item.basePrice) || 45;
            const total = Number(item.itemTotal) || qty * price;
            return {
              ...item,
              quantity: Math.max(1, qty),
              unitPrice: price,
              itemTotal: total,
            };
          });
      }
      return [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup' | 'dinein'
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync cart items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Could not save cart', e);
    }
  }, [cartItems]);

  /**
   * Unique item key depends on item ID + selected variant size + selected add-ons
   */
  const generateCartKey = (item, selectedSize, selectedAddons = []) => {
    const sizeName = selectedSize?.name || 'standard';
    const addonsKey = (selectedAddons || [])
      .map((a) => a.id)
      .sort()
      .join('-');
    return `${item.id || 'item'}_${sizeName}_${addonsKey}`;
  };

  /**
   * Add item to cart with size, addons, quantity and notes
   * Guaranteed NaN-safe numeric parsing
   */
  const addToCart = (item, quantity = 1, selectedSize = null, selectedAddons = [], instructions = '') => {
    if (!item) return;

    const defaultSize = selectedSize || (item.sizes && item.sizes.length > 0 ? item.sizes[0] : null);
    const cartKey = generateCartKey(item, defaultSize, selectedAddons);

    const safeQty = Math.max(1, Number(quantity) || 1);
    const rawBasePrice = Number(item.price) || Number(item.basePrice) || Number(item.unitPrice) || 45;
    const sizeExtra = Number(defaultSize?.price) || 0;
    const addonsExtra = (selectedAddons || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const singleUnitPrice = Math.max(0, rawBasePrice + sizeExtra + addonsExtra);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.cartKey === cartKey);
      if (existingIndex > -1) {
        const copy = [...prev];
        const newQty = (copy[existingIndex].quantity || 0) + safeQty;
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: newQty,
          unitPrice: singleUnitPrice,
          itemTotal: newQty * singleUnitPrice,
        };
        return copy;
      } else {
        const newItem = {
          cartKey,
          id: item.id || `item-${Date.now()}`,
          name: item.name || 'Special Dish',
          image: item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          basePrice: rawBasePrice,
          unitPrice: singleUnitPrice,
          quantity: safeQty,
          itemTotal: safeQty * singleUnitPrice,
          selectedSize: defaultSize,
          selectedAddons: selectedAddons || [],
          instructions: instructions || '',
        };
        return [...prev, newItem];
      }
    });
  };

  /**
   * Update quantity of a cart item
   */
  const updateQuantity = (cartKey, newQty) => {
    const parsedQty = Number(newQty) || 0;
    if (parsedQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartKey === cartKey) {
          const uPrice = Number(item.unitPrice) || 0;
          return {
            ...item,
            quantity: parsedQty,
            itemTotal: parsedQty * uPrice,
          };
        }
        return item;
      })
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  /**
   * Clear all items
   */
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Robust NaN-Safe Calculations
  const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const subtotal = Math.round(
    cartItems.reduce((acc, item) => {
      const lineTotal = Number(item.itemTotal) || (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
      return acc + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0)
  );

  // GST 5% on food items
  const gstRate = Number(restaurantData.gstPercent) || 5;
  const gst = Math.round((subtotal * gstRate) / 100);

  // Packaging fee (only for delivery & pickup, free for dinein)
  const pkgFee = Number(restaurantData.packagingFee) || 15;
  const packaging = orderType === 'dinein' || itemCount === 0 ? 0 : pkgFee;

  // Delivery fee (free above threshold, 0 for pickup & dinein)
  const dlvThreshold = Number(restaurantData.freeDeliveryThreshold) || 350;
  const defaultDlv = Number(restaurantData.defaultDeliveryFee) || 35;
  let deliveryFee = 0;
  if (orderType === 'delivery' && itemCount > 0) {
    if (subtotal >= dlvThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = defaultDlv;
    }
  }

  // Coupon discount
  let discount = 0;
  if (appliedCoupon && subtotal >= (Number(appliedCoupon.minOrder) || 0)) {
    discount = Math.min(subtotal, Number(appliedCoupon.discountAmount) || 0);
  }

  const calculatedTotal = subtotal + gst + packaging + deliveryFee - discount;
  const grandTotal = Math.max(0, isNaN(calculatedTotal) ? 0 : calculatedTotal);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal: isNaN(subtotal) ? 0 : subtotal,
        gst: isNaN(gst) ? 0 : gst,
        packaging: isNaN(packaging) ? 0 : packaging,
        deliveryFee: isNaN(deliveryFee) ? 0 : deliveryFee,
        discount: isNaN(discount) ? 0 : discount,
        grandTotal,
        appliedCoupon,
        setAppliedCoupon,
        orderType,
        setOrderType,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        generateCartKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
