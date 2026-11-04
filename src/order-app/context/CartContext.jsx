import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useOutlet } from './OutletContext';
import { shopApi } from '../services/shopApi';

const CartContext = createContext();

const CART_STORAGE_KEY = 'rajubhai_user_cart';
const QUOTE_DEBOUNCE_MS = 400;

export const CartProvider = ({ children }) => {
  const { outletId, info } = useOutlet();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return (
          parsed
            // Lines saved before carts were per outlet have no outletId and can no longer be ordered.
            .filter((item) => item && typeof item === 'object' && item.outletId)
            .map((item) => {
              // Prices are never kept in the cart: the server quote prices every line.
              // eslint-disable-next-line no-unused-vars
              const { unitPrice, itemTotal, basePrice, ...line } = item;
              return { ...line, quantity: Math.max(1, Number(item.quantity) || 1) };
            })
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  // The cart belongs to one outlet: once the outlet is known, lines from any other outlet go
  // (e.g. a ?outlet= link). Deliberate switches ask first, see hooks/useSwitchOutlet.js.
  useEffect(() => {
    if (!outletId) return;
    setCartItems((prev) => (prev.some((i) => i.outletId !== outletId) ? prev.filter((i) => i.outletId === outletId) : prev));
  }, [outletId]);

  const [isCartDrawerOpen, setDrawerOpen] = useState(false);

  // Where the in-page cart panel is visible (wide screens on the order page) it stands in
  // for the drawer: opening the drawer just brings the panel into view instead.
  const setIsCartDrawerOpen = (open) => {
    const panel = document.querySelector('[data-cart-panel]');
    if (open && panel && panel.offsetParent !== null) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    setDrawerOpen(open);
  };

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
    const sizeName = selectedSize?.id || selectedSize?.name || 'standard';
    const addonsKey = (selectedAddons || [])
      .map((a) => a.id)
      .sort()
      .join('-');
    return `${item.id || 'item'}_${sizeName}_${addonsKey}`;
  };

  /**
   * Add item to cart with size, addons, quantity and notes. No prices are stored or added up
   * here: the quote endpoint prices the cart.
   */
  // Checkout locks the cart while an order is on its way: an edit then would change what the
  // idempotency key stands for. The ref makes the lock take effect at once (state is next render).
  const lockRef = useRef(false);
  const [cartLocked, setCartLockedState] = useState(false);
  const setCartLocked = (locked) => {
    lockRef.current = locked;
    setCartLockedState(locked);
  };

  const addToCart = (item, quantity = 1, selectedSize = null, selectedAddons = [], instructions = '') => {
    if (!item || !outletId || lockRef.current) return;

    const defaultSize = selectedSize || (item.sizes && item.sizes.length > 0 ? item.sizes[0] : null);
    const cartKey = generateCartKey(item, defaultSize, selectedAddons);
    const safeQty = Math.max(1, Number(quantity) || 1);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.cartKey === cartKey);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], quantity: (copy[existingIndex].quantity || 0) + safeQty };
        return copy;
      }
      return [
        ...prev,
        {
          cartKey,
          id: item.id || `item-${Date.now()}`,
          name: item.name || 'Special Dish',
          image: item.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          quantity: safeQty,
          outletId,
          variationId: defaultSize?.id ?? null,
          addonIds: (selectedAddons || []).map((a) => a.id),
          selectedSize: defaultSize,
          selectedAddons: selectedAddons || [],
          instructions: instructions || '',
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    if (lockRef.current) return;
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, newQty) => {
    if (lockRef.current) return;
    const parsedQty = Number(newQty) || 0;
    if (parsedQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.cartKey === cartKey ? { ...item, quantity: parsedQty } : item)));
  };

  // ---- Server quote -------------------------------------------------------------------
  // The cart never adds anything up. Every money value shown comes from POST .../quote/,
  // re-requested (debounced) whenever the lines or the delivery address change.
  const [quoteAddress, setQuoteAddress] = useState(null); // { line, landmark } once known
  const [quoteState, setQuoteState] = useState({ sig: '', data: null, keys: [], error: null });
  const [retryNonce, setRetryNonce] = useState(0);
  const seqRef = useRef(0);

  const clearCart = () => {
    setCartItems([]);
    setQuoteAddress(null);
  };

  // The request lines, same order as the cart. Ids are opaque encrypted strings.
  const requestItems = useMemo(
    () =>
      cartItems.map((ci) => ({
        item_id: ci.id,
        variation_id: ci.variationId || '',
        addons: (ci.addonIds || []).map((id) => ({ id, qty: 1 })),
        qty: ci.quantity,
        note: (ci.instructions || '').slice(0, 200),
      })),
    [cartItems]
  );
  const address = useMemo(
    () => ({
      line: (quoteAddress?.line || '').trim().slice(0, 500),
      landmark: (quoteAddress?.landmark || '').trim().slice(0, 200),
    }),
    [quoteAddress]
  );
  const itemsSig = useMemo(() => JSON.stringify(requestItems), [requestItems]);
  const sig = `${outletId}|${itemsSig}|${address.line}|${address.landmark}`;

  useEffect(() => {
    if (!outletId || requestItems.length === 0) return undefined;
    const seq = ++seqRef.current;
    const ctrl = new AbortController();
    const keys = cartItems.map((ci) => ci.cartKey);
    const timer = setTimeout(async () => {
      try {
        const data = await shopApi.quote(outletId, requestItems, address, { signal: ctrl.signal });
        if (seq !== seqRef.current) return; // a newer request exists: ignore this answer
        setQuoteState({ sig, data, keys, error: null });
      } catch (e) {
        if (e?.name === 'AbortError' || seq !== seqRef.current) return;
        setQuoteState({ sig, data: null, keys, error: e });
      }
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, retryNonce]);

  const refreshQuote = useCallback(() => setRetryNonce((n) => n + 1), []);

  const hasLines = cartItems.length > 0;
  const quoteFresh = hasLines && quoteState.sig === sig;
  const quote = quoteFresh ? quoteState.data : null;
  const quoteError = quoteFresh ? quoteState.error : null;
  const quoteLoading = hasLines && !quoteFresh;

  // cartKey -> the server's answer for that line ({unit_price, line_total, error, qty}).
  // The quote's lines come back in request order, so they are matched by index.
  const lineQuotes = useMemo(() => {
    const map = {};
    (quoteState.data?.lines || []).forEach((line, i) => {
      if (quoteState.keys[i]) map[quoteState.keys[i]] = line;
    });
    return map;
  }, [quoteState]);

  const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const grandTotal = quote ? quote.grand_total : null;

  // Whether the customer may go on to checkout, and why not. `pending` = still calculating.
  const checkout = useMemo(() => {
    if (!hasLines) return { canCheckout: false, pending: false, reason: '' };
    if (info && info.accepting_orders === false) {
      return { canCheckout: false, pending: false, reason: info.closed_message || 'We are closed right now.' };
    }
    if (quoteError) return { canCheckout: false, pending: false, reason: quoteError.message };
    if (!quote) return { canCheckout: false, pending: true, reason: '' };
    if (quote.lines.some((l) => l.error)) {
      return { canCheckout: false, pending: false, reason: 'Some items need attention. Fix the items marked above.' };
    }
    if (!quote.eligible) {
      return { canCheckout: false, pending: false, reason: quote.reason || 'This order cannot be placed right now.' };
    }
    return { canCheckout: true, pending: false, reason: '' };
  }, [hasLines, info, quote, quoteError]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        grandTotal,
        quote,
        quoteLoading,
        quoteError,
        refreshQuote,
        lineQuotes,
        requestItems,
        itemsSig,
        checkout,
        setQuoteAddress,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartLocked,
        setCartLocked,
        generateCartKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
