// Website order statuses (server values) -> stepper step, friendly text and polling rhythm.
export const STEPPER_STEP = {
  received: 'Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

export const STATUS_LABEL = {
  received: 'Received',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Not accepted',
};

export const isTerminal = (status) => status === 'delivered' || status === 'rejected' || status === 'cancelled';

// Milliseconds until the next poll, or null to stop.
export const pollDelay = (status) => {
  if (isTerminal(status)) return null;
  return status === 'received' ? 5000 : 15000;
};
