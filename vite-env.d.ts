/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_JEWELER_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.pdf?url' {
  const url: string;
  export default url;
}
