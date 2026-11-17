import React from 'react';

// A shimmering placeholder bar shown where a figure is still being calculated. Keeping a bar of
// the same size as the number (instead of "...") stops the cart from jumping when the total arrives.
export const Skeleton = ({ width = 56, height = 16, style }) => (
  <span
    className="skel"
    role="status"
    aria-label="Calculating"
    style={{ width, height, ...style }}
  />
);
