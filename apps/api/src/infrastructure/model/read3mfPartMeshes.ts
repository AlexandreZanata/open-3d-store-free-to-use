import { unzipSync } from "fflate";

import { formatModelPartName } from "../../domain/services/formatModelPartName.js";
import { readBambuFilamentColours, readBambuObjectParts } from "./readBambu3mfMetadata.js";
import {
  appendMesh,
  emitAllRootMeshes,
  parseBuildItems,
  parseObjects,
  type MeshDef,
  type ObjectDef,
} from "./read3mfXml.js";
import { multiplyMat4, type Mat4 } from "./threeMfTransform.js";

export type RawPartMesh = {
  name: string;
  positions: Float32Array;
  defaultColorHex?: string;
};

/** Extract printable 3MF volumes as separate meshes (Bambu multi-body / multi-colour). */
export function read3mfPartMeshes(data: Buffer): RawPartMesh[] | null {
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

  const filamentColours = readBambuFilamentColours(data);
  const parsedModels = new Map<string, Map<number, ObjectDef>>();
  const parts: RawPartMesh[] = [];
  const buildItems = parseBuildItems(rootXml);
  const printableItems = buildItems.filter((item) => item.printable);
  const activeItems =
    printableItems.length > 1 ? [printableItems[0]!] : printableItems;

  for (const item of activeItems) {
    const metaParts = readBambuObjectParts(data, item.objectId);
    let metaIndex = 0;
    collectObjectMeshes(
      modelFiles,
      parsedModels,
      rootPath,
      item.objectId,
      item.transform,
      (mesh, transform, nameHint) => {
        const positions: number[] = [];
        appendMesh(mesh, transform, positions);
        if (positions.length < 9) {
          return;
        }
        const meta = metaParts[metaIndex];
        metaIndex += 1;
        const rawName = meta?.name ?? nameHint ?? `Part ${parts.length + 1}`;
        const extruder = meta?.extruder;
        const defaultColorHex =
          extruder && filamentColours[extruder - 1]
            ? filamentColours[extruder - 1]!.toUpperCase()
            : undefined;
        parts.push({
          name: formatModelPartName(rawName, parts.length),
          positions: new Float32Array(positions),
          ...(defaultColorHex ? { defaultColorHex } : {}),
        });
      },
    );
  }

  if (parts.length === 0) {
    const positions: number[] = [];
    emitAllRootMeshes(rootXml, positions);
    if (positions.length >= 9) {
      parts.push({
        name: formatModelPartName("Part", 0),
        positions: new Float32Array(positions),
      });
    }
  }

  return parts.length > 0 ? parts : null;
}

function collectObjectMeshes(
  modelFiles: Map<string, string>,
  parsedModels: Map<string, Map<number, ObjectDef>>,
  modelPath: string,
  objectId: number,
  transform: Mat4,
  onMesh: (mesh: MeshDef, transform: Mat4, nameHint: string | undefined) => void,
): void {
  const objects = getObjects(modelFiles, parsedModels, modelPath);
  const objectDef = objects.get(objectId);
  if (!objectDef) {
    return;
  }

  if (objectDef.kind === "mesh") {
    onMesh(objectDef.mesh, transform, objectDef.name);
    return;
  }

  for (const component of objectDef.components) {
    const combined = multiplyMat4(transform, component.transform);
    const targetPath = component.externalPath ?? modelPath;
    const hint = componentNameHint(component.externalPath) ?? objectDef.name;
    collectObjectMeshes(
      modelFiles,
      parsedModels,
      targetPath,
      component.objectId,
      combined,
      onMesh,
    );
  }
}

function componentNameHint(externalPath: string | null): string | undefined {
  if (!externalPath) {
    return undefined;
  }
  const base = externalPath.split("/").pop() ?? externalPath;
  return base.replace(/\.model$/i, "");
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
