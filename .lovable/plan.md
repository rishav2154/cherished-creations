

## Add Theme Toggle to Mobile Navbar Menu

### What changes
Add the dark/light mode toggle button inside the mobile dropdown menu, so mobile users can switch themes without needing the desktop navbar.

### Technical Details

**File: `src/components/layout/Navbar.tsx`**

- Import is already present (`ThemeToggle` from `@/components/theme/ThemeToggle`)
- Add `<ThemeToggle />` as a new row inside the mobile menu dropdown (the `AnimatePresence` block that renders when `isMobileMenuOpen` is true)
- Place it after the "Search Products" button, styled consistently with other menu items (flex row with label text "Theme" or "Dark/Light Mode")

The change is approximately 5 lines added to the mobile menu section, wrapping `<ThemeToggle />` in a div with matching padding and layout.

