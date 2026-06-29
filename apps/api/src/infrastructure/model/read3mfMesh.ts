import { unzipSync } from "fflate";

import {
  appendMesh,
  emitAllRootMeshes,
  parseBuildItems,
  parseObjects,
  type ObjectDef,
} from "./read3mfXml.js";
import { multiplyMat4, type Mat4 } from "./threeMfTransform.js";

/** Extract triangle soup (mm units) from a Bambu / 3MF OPC archive. */
export function read3mfMesh(data: Buffer): Float32Array | null {
  const entries = unzipSync(new Uint8Array(data));
  const modelFiles = indexModelFiles(entries);
  const rootPath = modelFiles.has("3D/3dmodel.model") ? "3D/3dmodel.model" : findFirstModelPath(modelFiles);
  if (!rootPath) {
    return null;
  }

  const rootXml = modelFiles.get(rootPath);
  if (!rootXml) {
    return null;
  }

  const parsedModels = new Map<string, Map<number, ObjectDef>>();
  const positions: number[] = [];

  for (const item of parseBuildItems(rootXml)) {
    if (!item.printable) {
      continue;
    }
    resolveObject(modelFiles, parsedModels, rootPath, item.objectId, item.transform, positions);
  }

  if (positions.length === 0) {
    emitAllRootMeshes(rootXml, positions);
  }

  return positions.length > 0 ? new Float32Array(positions) : null;
}

function indexModelFiles(entries: Record<string, Uint8Array>): Map<string, string> {
  const files = new Map<string, string>();
  for (const [name, bytes] of Object.entries(entries)) {
    if (!name.endsWith(".model")) {
      continue;
    }
    const xml = new TextDecoder().decode(bytes);
    files.set(name, xml);
    files.set(name.replace(/^\//, ""), xml);
  }
  return files;
}

function findFirstModelPath(files: Map<string, string>): string | null {
  for (const name of files.keys()) {
    if (name.endsWith("3dmodel.model")) {
      return name;
    }
  }
  return null;
}

function resolveObject(
  modelFiles: Map<string, string>,
  parsedModels: Map<string, Map<number, ObjectDef>>,
  modelPath: string,
  objectId: number,
  transform: Mat4,
  positions: number[],
): void {
  const objects = getObjects(modelFiles, parsedModels, modelPath);
  const objectDef = objects.get(objectId);
  if (!objectDef) {
    return;
  }

  if (objectDef.kind === "mesh") {
    appendMesh(objectDef.mesh, transform, positions);
    return;
  }

  for (const component of objectDef.components) {
    const combined = multiplyMat4(transform, component.transform);
    const targetPath = component.externalPath ?? modelPath;
    resolveObject(modelFiles, parsedModels, targetPath, component.objectId, combined, positions);
  }
}

function getObjects(
  modelFiles: Map<string, string>,
  parsedModels: Map<string, Map<number, ObjectDef>>,
  modelPath: string,
): Map<number, ObjectDef> {
  const cached = parsedModels.get(modelPath);
  if (cached) {
    return cached;
  }
  const xml = modelFiles.get(modelPath);
  const objects = xml ? parseObjects(xml) : new Map<number, ObjectDef>();
  parsedModels.set(modelPath, objects);
  return objects;
}
