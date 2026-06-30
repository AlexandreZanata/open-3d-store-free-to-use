/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ASSETS_BASE_URL?: string;
  readonly VITE_WHATSAPP_PHONE?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
