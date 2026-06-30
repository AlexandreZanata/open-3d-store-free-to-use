import { unzipSync } from "fflate";

export type BambuPartMeta = {
  name: string;
  extruder: number;
};

/** Parse Bambu `Metadata/project_settings.config` filament hex colours (1-based slot order). */
export function readBambuFilamentColours(data: Buffer): string[] {
  const entries = unzipSync(new Uint8Array(data));
  const raw = readEntryText(entries, "Metadata/project_settings.config");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as { filament_colour?: never };
    if (!Array.isArray(parsed.filament_colour)) {
      return [];
    }
    const colours: string[] = [];
    for (const value of parsed.filament_colour as never[]) {
      if (typeof value !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
        continue;
      }
      const hex: string = value;
      colours.push(hex.toUpperCase());
    }
    return colours;
  } catch {
    return [];
  }
}

/** Part names + extruder slots for a build object id (`Metadata/model_settings.config`). */
export function readBambuObjectParts(data: Buffer, objectId: number): BambuPartMeta[] {
  const entries = unzipSync(new Uint8Array(data));
  const xml = readEntryText(entries, "Metadata/model_settings.config");
  if (!xml) {
    return [];
  }

  const objectBlock = xml.match(new RegExp(`<object\\s+id="${objectId}"[\\s\\S]*?</object>`, "i"));
  if (!objectBlock) {
    return [];
  }

  const objectExtruderRaw = readMetaValue(objectBlock[0]!, "extruder");
  const objectExtruder = objectExtruderRaw ? Number(objectExtruderRaw) : NaN;

  const parts: BambuPartMeta[] = [];
  const partTag = /<part\b[^>]*>[\s\S]*?<\/part>/gi;
  let match = partTag.exec(objectBlock[0]!);
  while (match !== null) {
    const block = match[0];
    const subtype = readMetaValue(block, "subtype");
    if (subtype === "negative_part") {
      match = partTag.exec(objectBlock[0]!);
      continue;
    }
    const name = readMetaValue(block, "name");
    const extruderRaw = readMetaValue(block, "extruder");
    const extruder = extruderRaw ? Number(extruderRaw) : objectExtruder;
    if (name && Number.isFinite(extruder) && extruder > 0) {
      parts.push({ name, extruder });
    }
    match = partTag.exec(objectBlock[0]!);
  }

  return parts;
}

function readEntryText(entries: Record<string, Uint8Array>, path: string): string | null {
  const bytes = entries[path] ?? entries[`/${path}`];
  return bytes ? new TextDecoder().decode(bytes) : null;
}

function readMetaValue(block: string, key: string): string | null {
  const match = block.match(new RegExp(`<metadata\\s+key="${key}"\\s+value="([^"]*)"`, "i"));
  return match?.[1] ?? null;
}
