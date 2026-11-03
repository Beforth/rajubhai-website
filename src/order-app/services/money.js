// Display only. Amounts arrive from the server as decimal strings ("320.00"); the app never
// does arithmetic on them. "320.00" is shown as ₹320, "320.50" as ₹320.50.
export const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '';
  return `₹${String(amount).replace(/\.00$/, '')}`;
};
