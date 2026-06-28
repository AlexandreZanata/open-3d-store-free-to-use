import type { AdminUploadKind } from "@print3d/shared-types";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadAdminFile } from "@/lib/api/uploads";
import { resolveAssetUrl } from "@/lib/assets";
import { ApiError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

const ACCEPT_BY_KIND: Record<AdminUploadKind, string> = {
  thumbnail: "image/webp",
  gallery: "image/webp",
  model: ".glb,.gltf,model/gltf-binary,model/gltf+json",
};

type FileUploadFieldProps = {
  kind: AdminUploadKind;
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
};

export function FileUploadField({ kind, label, value, onChange, error }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const response = await uploadAdminFile(file, kind);
      onChange(response.data.url);
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? formatApiErrorMessage(caught.problem.detail, caught.problem.title)
          : "Upload failed";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewUrl = resolveAssetUrl(value);
  const showImagePreview = value.length > 0 && kind !== "model";

  return (
    <div className="space-y-3">
      <Input label={label} value={value} onChange={(event) => onChange(event.target.value)} error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_BY_KIND[kind]}
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Upload file"}
        </Button>
        {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
      </div>
      {showImagePreview ? (
        <img src={previewUrl} alt="" className="h-20 w-20 rounded-md border border-hairline object-cover" />
      ) : null}
      {kind === "model" && value ? (
        <p className="text-xs text-muted-foreground">Model URL: {value}</p>
      ) : null}
    </div>
  );
}
