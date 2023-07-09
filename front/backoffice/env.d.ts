/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: number;

    readonly VITE_PLAYERS_API_URL: string;

    readonly VITE_TOURNAMENT_API_URL: string;

    readonly VITE_CALENDAR_API_URL: string;

    readonly VITE_MATCHES_API_URL: string;

    readonly VITE_NODE_ENV: string;

    readonly VITE_JWT_SECRET: string;

    readonly VITE_JWT_VALIDITY: string;

    readonly VITE_MASTER_LOGIN: string;

    readonly VITE_MASTER_PASSWORD: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }