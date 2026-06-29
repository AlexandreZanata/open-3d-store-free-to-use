import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadAdminFile } from "@/lib/api/uploads";
import { waitForModelJob } from "@/lib/api/model-studio";
import { ApiError } from "@/lib/api/client";
import { UPLOAD_ACCEPT_BY_KIND } from "@/lib/uploadAccept";
import { formatApiErrorMessage } from "@/lib/utils";
import type { ModelPart } from "@print3d/shared-types";

type ModelUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onPartsDetected?: (parts: ModelPart[]) => void;
  error?: string;
};

export function ModelUploadField({
  label,
  value,
  onChange,
  onPartsDetected,
  error,
}: ModelUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setStatus("Uploading…");
    setIsUploading(true);
    try {
      const response = await uploadAdminFile(file, "model");

      const jobId = response.data.jobId;
      if (jobId && onPartsDetected) {
        setStatus("Processing mesh (queue)…");
        const { parts, previewUrl } = await waitForModelJob(jobId);
        onChange(previewUrl ?? response.data.url);
        onPartsDetected(parts);
        setStatus(
          previewUrl
            ? `Detected ${parts.length} part(s) — preview optimized for web`
            : `Detected ${parts.length} part(s)`,
        );
      } else {
        onChange(response.data.url);
        setStatus(null);
      }
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? formatApiErrorMessage(caught.problem.detail, caught.problem.title)
          : caught instanceof Error
            ? caught.message
            : "Upload failed";
      setUploadError(message);
      setStatus(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <Input label={label} value={value} onChange={(event) => onChange(event.target.value)} error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_ACCEPT_BY_KIND.model}
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Working…" : "Upload 3D model"}
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
        {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
      </div>
      {value ? <p className="text-xs text-muted-foreground break-all">Model URL: {value}</p> : null}
    </div>
  );
}
