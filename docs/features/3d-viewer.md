# 3D Viewer Module

## Strategy

Use **Three.js** (lazy-loaded chunk) with official addons:

- [`ThreeMFLoader`](https://threejs.org/docs/pages/ThreeMFLoader.html) — `.3mf` (millimeter coordinates per [3MF spec](https://3mf.io/specification/))
- [`GLTFLoader`](https://threejs.org/docs/pages/GLTFLoader.html) — `.glb` / `.gltf` (meter coordinates per Khronos glTF)
- [`OrbitControls`](https://threejs.org/docs/pages/OrbitControls.html) — rotate, zoom (dolly), pan

Replaces the previous `@google/model-viewer` CDN approach so `.3mf` print files render with real-world scale on a **virtual desk** (wood plane + grid).

## Target components

| File | Role |
|------|------|
| `apps/web/src/components/ModelViewer/ModelViewer.tsx` | React shell, poster fallback, dimension badge |
| `apps/web/src/components/ModelViewer/threeScene.ts` | Scene, desk, loaders, OrbitControls |
| `apps/web/src/components/ProductMedia/ProductMediaPanel.tsx` | 3D / gallery tabs on product page |
| `apps/web/src/components/ProductMedia/ProductImageCarousel.tsx` | Embla carousel for multiple photos |

### ModelViewer props

| Prop | Type | Description |
|------|------|-------------|
| `modelUrl` | string | Path to `.3mf`, `.glb`, or `.gltf` under `/models/3d/` |
| `posterUrl` | string | WebP thumbnail while loading |
| `productName` | string | Accessible alt text |

### Behavior

- Dynamic `import("./threeScene")` on mount — Three.js not in main bundle
- Virtual desk: 280×200 mm (3MF) or 0.28×0.2 m (glTF) with grid for scale reference
- Model sits on desk (`y = 0`); bounding box dimensions shown in mm
- OrbitControls: left-drag rotate, wheel zoom, right-drag pan
- Fixed `aspect-square` container; responsive width 100%

## Gallery carousel

`ProductImageCarousel` uses Embla (`embla-carousel-react`) with overlay prev/next controls and dot indicators. Slides = deduplicated `[thumbnailUrl, ...imageUrls]`.

## Usage on product page

**File:** `apps/web/src/routes/product.$slug.tsx`

```tsx
<ProductMediaPanel
  productName={product.name}
  thumbnailUrl={product.thumbnailUrl}
  imageUrls={product.imageUrls}
  modelFileUrl={product.modelFileUrl}
/>
```

## Model file layout (server)

```
/var/www/print3d/models/
├── 3d/           *.3mf, *.glb  (< 5 MB each, target < 3 MB)
├── thumbnails/   *.webp 400×400, < 50 KB
└── images/       *.webp gallery images
```

## File optimization (before upload)

**glTF / GLB:**

```bash
npx gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel 7
```

**3MF:** export from slicer with mesh units in millimeters (default in most slicers).

**Never commit model binaries to git.** Upload via admin panel or SCP.

## Admin upload MIME

| Stored | MIME | Extension |
|--------|------|-----------|
| glTF binary | `model/gltf-binary` | `.glb` |
| glTF JSON | `model/gltf+json` | `.gltf` |
| 3MF | `model/3mf` | `.3mf` |

## Nginx

Serve `/models/` directly — see [../infrastructure/nginx.md](../infrastructure/nginx.md).

## Harness rules

- `agent-rules/05-performance-and-scalability/resource-limits.md`
- Lazy load — Three.js in separate Vite chunk via dynamic import

## Tests

| Layer | File |
|-------|------|
| Web unit | `apps/web/tests/unit/modelFormat.test.ts` |
| E2E | `e2e/product-detail.spec.ts` |

## Related documents

- [../api/contract.md](../api/contract.md) — `modelFileUrl`, `imageUrls`
- [responsive-layout.md](responsive-layout.md) — product page two-column desktop layout
- [3MF Consortium viewer](https://github.com/3MFConsortium/3mfViewer) — reference implementation (lib3mf + Three.js)
