/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: number;

    readonly VITE_MATCHES_API_URL: string;

    readonly VITE_TOURNAMENT_API_URL: string;

    readonly VITE_CALENDAR_API_URL: string;

    readonly VITE_WEBSOCKET_API_URL: string;

    readonly VITE_NODE_ENV: string;

    readonly VITE_FRONT_HOME_URL: string;

    readonly VITE_FRONT_TOURNAMENT_URL: string;

    readonly VITE_FRONT_MATCH_URL: string;

    readonly VITE_FRONT_BO_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }