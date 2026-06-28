# 3D Viewer Module

## Strategy

Use `@google/model-viewer` web component via CDN — **zero bytes** added to React bundle. Handles WebGL, poster fallback, loading states, AR on supported devices.

## Target component

**File:** `apps/web/src/components/ModelViewer/ModelViewer.tsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `modelUrl` | string | Path to `.glb` e.g. `/models/3d/product.glb` |
| `posterUrl` | string | WebP thumbnail while loading |
| `productName` | string | Accessible alt text |

### Behavior

- Inject `model-viewer.min.js` script once on mount (lazy)
- Attributes: `camera-controls`, `auto-rotate`, `loading="lazy"`, `ar`
- Fixed height ~400px; responsive width 100%

## Usage on product page

**File:** `apps/web/src/routes/product.$slug.tsx` (after API integration)

Render only when `product.modelFileUrl` is non-null:

```tsx
{product.modelFileUrl && (
  <section aria-label="3D preview">
    <ModelViewer
      modelUrl={product.modelFileUrl}
      posterUrl={product.thumbnailUrl}
      productName={product.name}
    />
  </section>
)}
```

Current implementation: `apps/web/src/routes/product.$slug.tsx` — lazy-loads `ModelViewer` when `modelFileUrl` is set (Phase 7).

## Model file layout (server)

```
/var/www/print3d/models/
├── 3d/           *.glb  (< 5 MB each, target < 3 MB)
├── thumbnails/   *.webp 400×400, < 50 KB
└── images/       *.webp gallery images
```

## `.glb` optimization (before upload)

```bash
npx gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel 7
```

**Never commit `.glb` to git.** Upload via SCP or future admin panel.

## Nginx

Serve `/models/` directly — see [../infrastructure/nginx.md](../infrastructure/nginx.md).

## Harness rules

- `agent-rules/05-performance-and-scalability/resource-limits.md`
- Lazy load — do not bundle model-viewer in main chunk

## Related documents

- [../api/contract.md](../api/contract.md) — `modelFileUrl` field
- `.local/phases/07-frontend-integration.md`
