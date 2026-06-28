# Responsive layout (mobile + desktop)

The AXIS web app is **mobile-first**. Viewports below **1024px (`lg`)** keep the original phone UI unchanged. At `lg` and above, the layout expands for desktop without altering mobile markup or breakpoints.

## Breakpoint

| Viewport | Behavior |
|----------|----------|
| `< 1024px` | Original mobile UI — bottom tab bar, `max-w-2xl` content, horizontal product rails |
| `≥ 1024px` | Desktop UI — top navigation, `max-w-7xl` content, multi-column grids |

Implementation tokens live in `apps/web/src/lib/layout.ts`.

## Desktop changes (lg+)

| Area | Mobile (unchanged) | Desktop |
|------|-------------------|---------|
| **Navigation** | Fixed bottom 5-tab bar | Horizontal nav in header; bottom bar hidden |
| **Shell width** | `max-w-2xl` | `max-w-7xl` |
| **Home rails** | Horizontal scroll | 4–5 column grid |
| **Search** | Collapsible filters | Persistent left sidebar + wider product grid |
| **Categories** | 2-column grid | 3–4 column grid |
| **Product detail** | Single column + fixed bottom actions | Two columns (viewer / info) + inline actions |
| **Cart** | Full width | Centered `max-w-3xl` column |

## Key files

| File | Role |
|------|------|
| `apps/web/src/lib/layout.ts` | Shared Tailwind class tokens |
| `apps/web/src/components/AppShell.tsx` | Header + main shell |
| `apps/web/src/components/AppShellDesktopNav.tsx` | Desktop header navigation |
| `apps/web/src/components/AppShellMobileNav.tsx` | Mobile bottom tab bar |
| `apps/web/src/components/Rail.tsx` | Horizontal rail → grid on desktop |
| `apps/web/src/components/SearchFiltersPanel.tsx` | Search filters (sidebar + mobile drawer) |

## Testing

| Layer | File |
|-------|------|
| Unit | `apps/web/tests/layout.test.ts` — layout token contract |
| E2E | `e2e/desktop-layout.spec.ts` — desktop viewport (1280×800) |

Run E2E (requires API + DB):

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 pnpm e2e e2e/desktop-layout.spec.ts
```

## Manual validation

1. **Mobile** — DevTools device mode (e.g. iPhone 14, 390px): bottom tabs visible, no header nav links, horizontal product rails.
2. **Desktop** — Browser ≥1280px: header nav visible, no bottom tabs, home products in grid, search sidebar visible.
3. **Product page** — Desktop: viewer left, details right; mobile: stacked layout with fixed bottom CTA bar.

## Related

- [i18n.md](i18n.md)
- [3d-viewer.md](3d-viewer.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
