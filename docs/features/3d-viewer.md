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
| `apps/web/src/components/ModelViewer/ModelViewer.tsx` | React shell, loading overlay, dimension badge |
| `apps/web/src/components/ModelViewer/ModelViewerLoadingOverlay.tsx` | Black loading state with i18n label |
| `apps/web/src/components/ModelViewer/threeScene.ts` | Scene, desk, loaders, OrbitControls |
| `apps/web/src/components/ProductMedia/ProductMediaPanel.tsx` | 3D / gallery tabs on product page |
| `apps/web/src/components/ProductMedia/ProductImageCarousel.tsx` | Embla carousel for multiple photos |

### ModelViewer props

| Prop | Type | Description |
|------|------|-------------|
| `modelUrl` | string | Path to `.3mf`, `.glb`, `.gltf`, or `.stl` under `/models/3d/` |
| `posterUrl` | string | WebP thumbnail while loading |
| `productName` | string | Accessible alt text |
| `modelParts` | `ModelPart[]` | Optional mesh parts from API (for per-part colors) |
| `partColors` | `Record<string, string>` | Part id → hex color applied in Three.js |

### Behavior

- Dynamic `import("./threeScene")` on mount — Three.js not in main bundle
- Virtual desk: 280×200 mm (3MF) or 0.28×0.2 m (glTF) with grid for scale reference
- Model sits on desk (`y = 0`); bounding box dimensions shown in mm
- OrbitControls: left-drag rotate, wheel zoom, right-drag pan
- Fixed `aspect-square` container; responsive width 100%
- While the GLB/3MF loads, a **black overlay** (`bg-foreground`) covers the canvas with bilingual status text (`product.viewerLoading`). Scale badge and dimensions appear only after `onReady`.
- Hero logo (`HeroLogoViewer`): keeps rendering when off-screen (rotation pauses only); mounts after the tile has non-zero size; shows a **solid black corvo PNG** (`/brand/corvo-logo.png` + `brightness-0`, same fit ratio as `fitCameraToModel`) until the GLB is ready — stays visible if the GLB fails to load (404)

## Upright orientation (Z-up → Y-up)

This project uses **Three.js**, not `@google/model-viewer`. Do not add `<model-viewer>` or HTML `orientation` attributes.

| Layer | Responsibility |
|-------|----------------|
| **Upload / worker** | `orientSlicerExportForPreview()` — Z-up build plate → Y-up when `minZ ≈ 0` and height is not already on +Y; thin plates use PCA fallback |
| **Storefront** | `threeScene.ts` — `placeOnDesk()` sets `y = 0` on virtual desk + grid; OrbitControls orbit upright |
| **Hero logo** | `orientHeroLogoMesh()` in preview pipeline; mesh color `#141414` in `heroLogoScene.ts` |

Storefront serves **`-preview.glb`** siblings (≤ 20 MB). Raw `.3mf` / `.stl` are never loaded in the browser.

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
  modelParts={product.modelParts}
  availableColors={shopConfig.availableColors}
/>
```

`availableColors` comes from `GET /shop/config`. Customers pick a color per `modelParts` entry; `ModelViewer` tints meshes by index/name match.

## Model file layout (server)

```
/var/www/print3d/models/
├── 3d/           *.3mf, *.glb, *.stl  (up to 256 MB; target < 50 MB for catalog)
├── thumbnails/   *.webp 400×400, < 50 KB
└── images/       *.webp gallery images
```

Admin `kind=model` uploads enqueue async mesh extraction (`model_processing_jobs` + RabbitMQ worker). Poll `GET /api/v1/admin/model-jobs/:id` for `parts` (names, estimated volume/weight) and optional `previewUrl` (optimized GLB for storefront).

## Server-side preview optimization

Any catalog upload (`STL`, `GLB`, `GLTF`, `3MF`) is converted automatically to a **Draco GLB** (`{id}-preview.glb`, target &lt; 20 MB):

1. Worker ingests the source mesh (STL triangle soup, 3MF XML zip, or glTF)
2. **Unit detection** — millimeter vs meter coordinates (heuristic on bounding box)
3. **Print orientation** — explicit Z-up → Y-up rotation (-90° about X, same as glTF convention); thin plates use PCA fallback; yaw snap for compact footprint; build-plate centering baked into the GLB
4. **glTF encoding** — indexed `TRIANGLES` primitive + PBR material; `weld` → `dedup` → `meshopt simplify` → `normals` → **Draco**
5. Upload worker passes the on-disk buffer once (`sourceData`) and runs part analysis + preview optimization **in parallel**
6. **Draco** compression for web streaming
7. Admin upload response `url` is the preview when ready; `sourceUrl` keeps the original for print
8. Public product API resolves `modelFileUrl` to the preview sibling on disk when present (no manual re-link)

**Automatic orientation:** every admin `kind=model` upload runs `ProcessModelUpload` → `optimizeModelPreview` → `orientSlicerExportForPreview` (STL, 3MF, GLB, GLTF). The admin UI sets `modelFileUrl` to `previewUrl` when the job completes. Re-deploy runs `pnpm --filter @print3d/api reoptimize-all-previews` (see `infra/scripts/deploy.sh`) to refresh existing `-preview.glb` files without re-uploading.

**3MF (Bambu Studio):** the reader resolves `<build>` items, nested `<components>`, external `3D/Objects/*.model` files, and 3×4 transform matrices per the [3MF specification](https://3mf.io/specification/).

## Seed catalog models

`pnpm --filter @print3d/api db:seed` copies real STL/3MF files from `SEED_MODELS_SOURCE_DIR` (default `/data/downloads`) into `MODEL_FILES_BASE_PATH/3d/seed-{slug}.*`, optimizes each to `-preview.glb`, and updates product `modelFileUrl` / `modelParts`:

| Product slug | Source file |
|--------------|-------------|
| `custom-photo-frame` | `placa_estudo_hiragana_PRONTA.stl` |
| `dragon-figurine` | `mini_dino.3mf` |
| `phone-stand` | `iPhone_Stand_-_Standard.3mf` |
| `custom-keychain` | `polar_bear_keychain_-_profile.3mf` |
| `planter-pot` | `Capy.3mf` |

If a source file is missing, that product keeps its catalog metadata without a model URL.

**Desktop hero logo:** `pnpm --filter @print3d/api db:seed-hero-logo` prefers STL from `SEED_MODELS_SOURCE_DIR` (`16cc56c8094335eec1baddcd7a39f5b5(1).stl`). If missing, copies **`apps/api/seed-assets/hero/corvo-logo-preview.glb`** (committed) to `models/3d/` so VPS seed works without Bambu downloads.

Re-run optimization for an existing product:

```bash
pnpm --filter @print3d/api reoptimize-model custom-photo-frame
pnpm --filter @print3d/api reoptimize-model dragon-figurine storage/models/3d/<upload-id>.stl
```

## Browser preview limits

The storefront viewer loads models in the browser via Three.js. Large meshes can freeze or crash the tab.

| Limit | Value | Behavior |
|-------|-------|----------|
| Max file size (HEAD `Content-Length`) | 20 MB | Shows poster + message; does not parse the file |
| Max STL vertices after parse | 600,000 | Disposes geometry and shows the same message |

The API accepts uploads up to **256 MB** for storage and worker analysis. The storefront never loads the raw file when a `-preview.glb` sibling exists.

`GET` and `HEAD` `/models/*` responses include `Content-Length` so the viewer can reject oversized files before download.

The storefront `GLTFLoader` registers **DRACOLoader** and **MeshoptDecoder** (same extensions used by the server preview pipeline).

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
| STL | `model/stl` | `.stl` |

## Nginx

Serve `/models/` directly — see [../infrastructure/nginx.md](../infrastructure/nginx.md).

## Harness rules

- `agent-rules/05-performance-and-scalability/resource-limits.md`
- Lazy load — Three.js in separate Vite chunk via dynamic import

## Tests

| Layer | File |
|-------|------|
| Web unit | `apps/web/tests/unit/modelFormat.test.ts`, `apps/web/tests/unit/modelViewerLimits.test.ts`, `apps/web/tests/unit/modelViewerLoading.test.ts` |
| API unit | `apps/api/tests/unit/infrastructure/orientMeshForPrintPreview.test.ts`, `documentFromMesh.test.ts`, `read3mfMesh.test.ts` |
| E2E | `e2e/product-detail.spec.ts` |

## Related documents

- [../api/contract.md](../api/contract.md) — `modelFileUrl`, `imageUrls`
- [responsive-layout.md](responsive-layout.md) — product page two-column desktop layout
- [3MF Consortium viewer](https://github.com/3MFConsortium/3mfViewer) — reference implementation (lib3mf + Three.js)
