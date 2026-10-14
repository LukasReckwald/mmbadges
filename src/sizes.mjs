// Dimensions per badge size, shared by brand and status badges
//   H = height, PAD = left/right padding, ICON = icon size,
//   GAP = space between icon and text, FONT = font size, WEIGHT = font weight (brand badges)

export const SIZES = {
  sm: { H: 20, PAD: 7, ICON: 11, GAP: 4, FONT: 11, WEIGHT: 500 },
  md: { H: 24, PAD: 9, ICON: 14, GAP: 5, FONT: 12, WEIGHT: 500 },
  lg: { H: 28, PAD: 11, ICON: 16, GAP: 6, FONT: 13, WEIGHT: 600 },
};

export const getSize = (size) => SIZES[size] || SIZES.md;
