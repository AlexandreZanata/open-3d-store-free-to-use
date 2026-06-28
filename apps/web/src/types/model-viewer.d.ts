import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerElementProps = HTMLAttributes<HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  loading?: "auto" | "lazy" | "eager";
  ar?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<ModelViewerElementProps, HTMLElement>;
    }
  }
}

export {};
