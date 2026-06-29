import type { AdminUploadKind } from "@print3d/shared-types";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadAdminFile } from "@/lib/api/uploads";
import { resolveAssetUrl } from "@/lib/assets";
import { ApiError } from "@/lib/api/client";
import { IMAGE_UPLOAD_HINT, UPLOAD_ACCEPT_BY_KIND } from "@/lib/uploadAccept";
import { formatApiErrorMessage } from "@/lib/utils";

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
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remotePreviewFailed, setRemotePreviewFailed] = useState(false);
  const remotePreviewUrl = value.length > 0 ? resolveAssetUrl(value) : "";

  function clearLocalPreview() {
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  useEffect(() => {
    setRemotePreviewFailed(false);
  }, [value]);

  useEffect(() => {
    if (!localPreview || remotePreviewUrl.length === 0) {
      return;
    }

    const image = new Image();
    image.onload = () => clearLocalPreview();
    image.onerror = () => {
      // Keep blob preview when the API asset is not reachable yet.
    };
    image.src = remotePreviewUrl;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [localPreview, remotePreviewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextLocalPreview = URL.createObjectURL(file);
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextLocalPreview;
    });
    setUploadError(null);
    setRemotePreviewFailed(false);
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

  const previewSrc = localPreview ?? (remotePreviewFailed ? "" : remotePreviewUrl);
  const showImagePreview = kind !== "model" && previewSrc.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {kind !== "model" ? (
          <div
            className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-surface"
            data-testid={`upload-preview-${kind}`}
          >
            {showImagePreview ? (
              <img
                src={previewSrc}
                alt=""
                className="size-full object-cover"
                onError={() => {
                  if (localPreview) return;
                  setRemotePreviewFailed(true);
                }}
              />
            ) : (
              <span className="px-3 text-center text-xs text-muted-foreground">
                {isUploading ? "Uploading…" : "No image"}
              </span>
            )}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          <Input label={label} value={value} onChange={(event) => onChange(event.target.value)} error={error} />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={UPLOAD_ACCEPT_BY_KIND[kind]}
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
            {kind !== "model" ? (
              <p className="text-xs text-muted-foreground">{IMAGE_UPLOAD_HINT}</p>
            ) : null}
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
            {remotePreviewFailed && value ? (
              <p className="text-xs text-destructive">Preview unavailable — check VITE_ASSETS_BASE_URL matches the API host.</p>
            ) : null}
          </div>
        </div>
      </div>

      {kind === "model" && value ? (
        <p className="text-xs text-muted-foreground">Model URL: {value}</p>
      ) : null}
    </div>
  );
}
