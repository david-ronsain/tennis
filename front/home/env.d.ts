/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: number;

    readonly VITE_MATCHES_API_URL: string;

    readonly VITE_WEBSOCKET_API_URL: string;

    readonly VITE_NODE_ENV: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }