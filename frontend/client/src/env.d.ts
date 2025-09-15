/// <reference types="vite/client" />

// Declare the variables you expect in import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string; // 👈 required backend API base URL
}

// Extend the ImportMeta interface so TS knows it has an `env` property
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
