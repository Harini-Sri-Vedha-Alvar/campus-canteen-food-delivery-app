## Packages
framer-motion | For fluid page transitions and interactive micro-animations
date-fns | For formatting order dates in a human-readable way

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  sans: ["var(--font-sans)"],
}
Colors are configured using CSS variables for a bold, vibrant aesthetic.
Cart operations read from database cart_items.
Prices are handled in cents on backend, formatted to dollars on frontend.
