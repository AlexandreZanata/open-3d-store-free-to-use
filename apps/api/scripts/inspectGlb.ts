import { createGltfIo } from "../src/infrastructure/model/createGltfIo.js";

async function main(): Promise<void> {
  const io = await createGltfIo();
  const doc = await io.read(
    "storage/models/3d/019f154c-0d1f-7638-9e1e-0a3670161157-preview.glb",
  );
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) {
        continue;
      }
      const min = pos.getMin([]);
      const max = pos.getMax([]);
      console.log(mesh.getName(), "verts:", pos.getCount(), "min:", min, "max:", max);
    }
  }
}

main().catch(console.error);
