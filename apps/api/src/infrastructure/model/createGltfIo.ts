import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

let ioPromise: Promise<NodeIO> | null = null;

export function createGltfIo(): Promise<NodeIO> {
  ioPromise ??= initIo();
  return ioPromise;
}

async function initIo(): Promise<NodeIO> {
  return new NodeIO()
    .registerExtensions([KHRDracoMeshCompression, KHRMeshQuantization])
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
      "meshopt.decoder": MeshoptDecoder,
      "meshopt.encoder": MeshoptEncoder,
    });
}
