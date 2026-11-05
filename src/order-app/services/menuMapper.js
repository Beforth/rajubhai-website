// Turns the shop menu payload into the shape the existing cards, modal and cart use.
// Ids stay opaque strings. Prices become Numbers for the local display math only.
const FALLBACK_IMAGE = '/dabeli-hero.png';
const num = (v) => Number(v) || 0;

function mapItem(raw, categoryId) {
  const variations = (raw.variations || []).map((v) => ({ id: v.id, label: v.name, full: num(v.price) }));
  // A variation price is a FULL price. The UI adds `size.price` on top of `item.price`,
  // so the base is the cheapest variation and each size carries its difference.
  const base = variations.length ? Math.min(...variations.map((v) => v.full)) : num(raw.price);
  const sizes = variations.map((v) => ({
    id: v.id,
    label: v.label,
    name: v.label,
    price: v.full - base,
    fullPrice: v.full,
  }));

  const addonGroups = (raw.addon_groups || []).map((g) => ({
    id: g.id,
    name: g.name,
    min: g.min,
    max: g.max,
    required: !!g.required,
    selectionMode: g.selection_mode,
  }));
  const addons = [];
  (raw.addon_groups || []).forEach((g) => {
    (g.addons || []).forEach((a) =>
      addons.push({ id: a.id, label: a.name, name: a.name, price: num(a.price), groupId: g.id, isVeg: a.veg !== false })
    );
  });

  return {
    id: raw.id,
    categoryId,
    name: raw.name,
    description: raw.description || '',
    price: base,
    isVeg: raw.veg !== false,
    image: raw.image || FALLBACK_IMAGE,
    tags: raw.tags || [],
    sizes,
    addons,
    addonGroups,
  };
}

export function toUiMenu(menuData) {
  const categories = [];
  const items = [];
  (menuData?.categories || []).forEach((c) => {
    const mapped = (c.items || []).map((i) => mapItem(i, c.id));
    if (!mapped.length) return;
    categories.push({ id: c.id, name: c.name });
    items.push(...mapped);
  });
  return { categories, items };
}
