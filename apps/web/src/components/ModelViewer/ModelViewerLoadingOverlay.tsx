type ModelViewerLoadingOverlayProps = {
  label: string;
};

/** Black loading shell — contract: docs/features/3d-viewer.md */
export function ModelViewerLoadingOverlay({ label }: ModelViewerLoadingOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center bg-foreground px-6 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="model-viewer-loading"
    >
      <p className="text-sm font-medium tracking-tight text-background/90">{label}</p>
    </div>
  );
}
