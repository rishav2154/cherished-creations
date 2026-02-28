

## Fix Shop.tsx UI

The code you pasted had all JSX/HTML tags stripped out (angle brackets were removed), leaving broken template markup. I'll reconstruct the full working Shop.tsx with proper JSX, preserving all the logic and content you intended.

### What's being fixed
- All JSX elements (`div`, `motion.div`, `button`, `Input`, `Slider`, `Link`, etc.) need their tags restored
- The entire component template needs to be rebuilt as valid JSX

### What's being preserved (no content changes)
- All imports, hooks, state, and logic (debounced URL params, `finalProducts`, `handleCategoryChange`, etc.)
- All text content, class names, and styling exactly as you specified
- The layout structure: page header, prominent search bar, desktop sidebar, mobile filter panel, grid controls (2/3/4 cols), product grid with custom product handling, empty state

### Key UI features in the reconstructed code
- Prominent full-width search bar below the header
- Desktop sidebar with category cards, price slider, and clear filters
- Mobile: inline collapsible filter panel (not a drawer) with category grid
- Grid toggle for 2, 3, or 4 columns on desktop
- Custom product (phone cover) gets a special "Customize Now" wrapper with Link
- Empty state with search icon and clear filters button

### Technical details
- **File changed**: `src/pages/Shop.tsx` (full rewrite to fix broken JSX)
- No other files are modified
- The `Button` component from `@/components/ui/button` is used (already exists)
- `Link` from `react-router-dom` is used for the custom product wrapper
- TypeScript generics like `Record<string, string | null>` and `useRef<NodeJS.Timeout>` will be properly typed

