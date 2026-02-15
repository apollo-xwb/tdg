/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_JEWELER_EMAIL: string;
  /** Comma-separated list of dev admin emails allowed into the pricing lab. */
  readonly VITE_DEV_PRICING_ADMINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.pdf?url' {
  const url: string;
  export default url;
}

declare module '*.glb?url' {
  const url: string;
  export default url;
}

declare module '*.csv?raw' {
  const content: string;
  export default content;
}
