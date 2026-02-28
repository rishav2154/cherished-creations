
# Fix Light Mode Theme

## Problems Identified

1. **Hero banner text invisible** -- The gradient overlay uses `from-background via-background/60` which is near-white in light mode, making the white hero text unreadable against a washed-out background.
2. **Missing light-mode CSS custom properties** -- Variables like `--glass-bg`, `--glass-border`, `--glass-shadow`, `--luxury-deep-*`, `--accent-warm`, `--accent-pink`, `--gold` have no `.light` overrides, so they use dark-theme values in light mode.
3. **Sidebar variables missing in light mode** -- `--sidebar-*` variables are not defined in `.light`, causing dark backgrounds in sidebar components.
4. **Low-contrast sections** -- `bg-card/60` and `bg-card/30` classes result in barely visible section separators in light mode.

## Changes

### 1. Update `src/index.css` -- Add complete light-mode variable overrides

Add the following inside the `.light` block:
- `--glass-bg`, `--glass-border`, `--glass-shadow` tuned for light backgrounds (white glass with subtle borders)
- `--luxury-deep-*`, `--accent-warm`, `--accent-pink`, `--gold`, `--gold-muted` values adjusted for light theme readability
- `--sidebar-*` variables for light mode (light background, dark foreground)
- Gradient variables adjusted for light theme

### 2. Update `src/components/home/HeroSection.tsx` -- Fix hero text contrast

- Change the gradient overlay from `from-background via-background/60` to a dark overlay that works in both themes: use a class like `from-black/70 via-black/40 to-transparent` so the hero text is always readable against the banner image regardless of theme.
- Ensure the slide title and subtitle text uses white (`text-white`) on the hero since the overlay is always dark.
- Update the search bar below to keep using theme-aware tokens (`bg-card`, `border-border`).

### 3. Update `src/components/home/CategoriesSection.tsx` -- Fix section background

- Change `bg-card/30` to `bg-muted/50` for better contrast in light mode.

### 4. Update `src/components/home/MarqueeBanner.tsx` -- Fix banner background

- Change `bg-card/60` to `bg-muted/40` for visible separation in light mode.

### 5. Update `src/components/home/FeaturedProducts.tsx` -- Fix offer banner overlays

- Change offer banner gradient overlays from `from-background/95 via-background/70 to-background/30` to a dark overlay (`from-black/70 via-black/50 to-transparent`) so banner text is always readable.
- Use `text-white` for banner text labels instead of `text-foreground` since overlay is always dark.

### 6. Update `src/components/layout/Navbar.tsx` -- Ensure consistent light-mode nav

- The navbar already uses `bg-background/95` which should work fine with proper variable overrides. No changes needed.

## Summary

The root cause is that the theme was designed dark-first, and light mode only defines basic token overrides but misses custom properties and uses theme-relative overlays on images where a fixed dark overlay is needed. The fix adds comprehensive light-mode variables and switches image overlays to fixed dark gradients with white text for universal readability.
