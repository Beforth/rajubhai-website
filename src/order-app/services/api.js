import menuData from '../data/menu.json';
import categoriesData from '../data/categories.json';
import couponsData from '../data/coupons.json';
import restaurantData from '../data/restaurant.json';

// Local storage key for persistent orders
const ORDERS_STORAGE_KEY = 'rajubhai_pos_orders';

// Helper to simulate network latency for POS API readiness
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch restaurant info, hours, settings
 */
export async function getRestaurantInfo() {
  await delay(150);
  return { ...restaurantData };
}

/**
 * Fetch full menu categories
 */
export async function getCategories() {
  await delay(150);
  return [...categoriesData];
}

/**
 * Fetch all menu items or filter by category
 */
export async function getMenu(categoryId = null) {
  await delay(250);
  if (!categoryId || categoryId === 'all') {
    return [...menuData];
  }
  return menuData.filter((item) => item.categoryId === categoryId);
}

/**
 * Fetch single menu item by ID
 */
export async function getMenuItemById(id) {
  await delay(100);
  const found = menuData.find((item) => item.id === id);
  if (!found) throw new Error('Menu item not found');
  return { ...found };
}

/**
 * Validate and apply coupon code
 */
export async function applyCoupon(code, orderSubtotal) {
  await delay(200);
  const cleanCode = code.trim().toUpperCase();
  const coupon = couponsData.find((c) => c.code === cleanCode);

  if (!coupon) {
    return { success: false, message: 'Invalid promo code' };
  }

  if (orderSubtotal < coupon.minOrder) {
    return {
      success: false,
      message: `Minimum order value of ₹${coupon.minOrder} required for ${cleanCode}`,
    };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = Math.min((orderSubtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
  } else if (coupon.discountFlat) {
    discount = coupon.discountFlat;
  }

  return {
    success: true,
    code: cleanCode,
    discountAmount: Math.round(discount),
    message: `Promo code ${cleanCode} applied successfully!`,
  };
}

/**
 * Place a new order formatted for POS Dashboard ingestion
 * Order object structure:
 * {
 *   orderId: "RJB-...",
 *   items: [...],
 *   customer: { name, phone, address, instructions },
 *   orderType: 'delivery' | 'pickup' | 'dinein',
 *   payment: { method: 'upi' | 'card' | 'cod', status: 'PAID' | 'PENDING', transactionId: '...' },
 *   totals: { subtotal, gst, packaging, deliveryFee, discount, grandTotal },
 *   status: 'Placed' | 'Accepted' | 'Preparing' | 'Ready' | 'Out for delivery' | 'Delivered',
 *   timestamps: { placedAt, updatedAt, estimatedDeliveryAt }
 * }
 */
export async function placeOrder(orderPayload) {
  await delay(500);

  const orderId = 'RJB-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  const fullOrder = {
    ...orderPayload,
    orderId,
    status: 'Placed',
    timestamps: {
      placedAt: now,
      updatedAt: now,
      estimatedDeliveryAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  };

  // Persist locally for demo tracking & POS order simulation
  try {
    const existingRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(fullOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save order to local storage', err);
  }

  return fullOrder;
}

/**
 * Get order tracking status by order ID
 */
export async function getOrderById(orderId) {
  await delay(200);
  try {
    const existingRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const found = existing.find((o) => o.orderId === orderId);
    if (found) {
      // Simulate live status progression based on time elapsed
      return calculateDynamicOrderStatus(found);
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback demo mock order if queried freshly
  return {
    orderId,
    status: 'Preparing',
    items: [
      {
        id: 'dab-01',
        name: 'Original Rajubhai Special Dabeli',
        price: 45,
        quantity: 2,
        selectedSize: { name: 'Single Pav', price: 0 },
        selectedAddons: [{ id: 'cheese', name: 'Extra Amul Cheese', price: 20 }],
        itemTotal: 130,
      },
    ],
    customer: {
      name: 'Ramesh Patel',
      phone: '9876543210',
      address: { street: '42 Sardar Patel Ring Road', landmark: 'Near Town Hall' },
    },
    orderType: 'delivery',
    payment: { method: 'upi', status: 'PAID', transactionId: 'UPI-TXN-998811' },
    totals: { subtotal: 130, gst: 7, packaging: 15, deliveryFee: 35, discount: 0, grandTotal: 187 },
    timestamps: {
      placedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDeliveryAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Calculates simulated progress steps for realistic demo
 */
function calculateDynamicOrderStatus(order) {
  const placedTime = new Date(order.timestamps?.placedAt || Date.now()).getTime();
  const elapsedMinutes = (Date.now() - placedTime) / (1000 * 60);

  let status = order.status;
  if (elapsedMinutes > 15) {
    status = 'Delivered';
  } else if (elapsedMinutes > 10) {
    status = order.orderType === 'delivery' ? 'Out for delivery' : 'Ready';
  } else if (elapsedMinutes > 5) {
    status = 'Preparing';
  } else if (elapsedMinutes > 1) {
    status = 'Accepted';
  } else {
    status = 'Placed';
  }

  return {
    ...order,
    status,
  };
}

/**
 * Fetch all user orders
 */
export async function getUserOrders(phone = null) {
  await delay(200);
  try {
    const existingRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    if (!phone) return existing;
    return existing.filter((o) => o.customer?.phone === phone);
  } catch (err) {
    return [];
  }
}

/**
 * Mock phone + OTP Authentication
 */
export async function sendOtp(phone) {
  await delay(300);
  if (!phone || phone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }
  // Mock default OTP: 1987 (Year of establishment) or 1234
  return { success: true, message: 'OTP sent! Use demo OTP: 1987' };
}

export async function verifyOtp(phone, otp, name = '') {
  await delay(350);
  if (otp !== '1987' && otp !== '1234') {
    throw new Error('Invalid OTP! Please use demo OTP: 1987');
  }

  const user = {
    id: 'USR-' + phone.slice(-4),
    phone,
    name: name || 'Foodie Customer',
    addresses: [
      {
        id: 'addr-1',
        tag: 'Home',
        line1: 'B-204, Swaminarayan Heights',
        landmark: 'Opposite Jubilee Ground',
        city: 'Bhuj',
      },
    ],
  };

  return { success: true, user, token: 'mock-jwt-token-1987' };
}
