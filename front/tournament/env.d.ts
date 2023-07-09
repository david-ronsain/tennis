/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: number;

    readonly VITE_TOURNAMENT_API_URL: string;

    readonly VITE_CALENDAR_API_URL: string;

    readonly VITE_NODE_ENV: string;

    readonly VITE_WEBSOCKET_API_URL: string;

    readonly VITE_FRONT_MATCH_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }