import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MODEL_VIEWER_SCRIPT =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

let scriptPromise: Promise<void> | null = null;

function loadModelViewerScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (customElements.get("model-viewer")) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load model-viewer"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type ModelViewerProps = {
  modelUrl: string;
  posterUrl: string;
  productName: string;
};

export function ModelViewer({ modelUrl, posterUrl, productName }: ModelViewerProps) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadModelViewerScript()
      .then(() => {
        if (mounted.current) {
          setReady(true);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setFailed(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  if (failed) {
    return (
      <div className="h-[400px] w-full rounded-2xl bg-muted grid place-items-center text-sm text-muted-foreground">
        {t("product.viewerUnavailable")}
      </div>
    );
  }

  if (!ready) {
    return <div className="h-[400px] w-full rounded-2xl bg-muted animate-pulse" aria-hidden />;
  }

  return (
    <model-viewer
      src={modelUrl}
      poster={posterUrl}
      alt={productName}
      camera-controls
      auto-rotate
      loading="lazy"
      ar
      className="h-[400px] w-full rounded-2xl bg-muted"
    />
  );
}
