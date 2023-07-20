/// <reference types="vite/client" />

interface ImportMetaEnv {

    readonly VITE_JWT_SECRET: string;

    readonly VITE_JWT_VALIDITY: string;

    readonly VITE_MASTER_LOGIN: string;

    readonly VITE_MASTER_PASSWORD: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }