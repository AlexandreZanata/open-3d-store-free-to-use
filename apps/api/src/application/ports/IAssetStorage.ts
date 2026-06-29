import type { AdminUploadKind, AdminUploadMimeType } from "@print3d/shared-types";

export type AssetUploadInput = {
  kind: AdminUploadKind;
  filename: string;
  mimeType: string;
  data: Buffer;
};

export type AssetUploadResult = {
  url: string;
  mimeType: AdminUploadMimeType;
  sizeBytes: number;
  kind: AdminUploadKind;
};

export interface IAssetStorage {
  saveUpload(input: AssetUploadInput): Promise<AssetUploadResult>;
  resolvePathFromPublicUrl(publicUrl: string): string;
}
