// Orders placed from this browser, so a guest can find them again. Only ids are kept: the
// server is the source of truth for status and totals.
const KEY = 'rajubhai.orders';
const MAX = 20;

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((o) => o && typeof o.publicId === 'string') : [];
  } catch {
    return [];
  }
};

const write = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode): the order just will not be remembered */
  }
};

export const orderStore = {
  list: () => read(),
  add: (publicId, reference) => {
    if (!publicId) return;
    const rest = read().filter((o) => o.publicId !== publicId);
    write([{ publicId, reference: reference || '', placedAt: new Date().toISOString() }, ...rest].slice(0, MAX));
  },
  remove: (publicId) => write(read().filter((o) => o.publicId !== publicId)),
};
