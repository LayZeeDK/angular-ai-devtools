interface ImportMetaEnv {
  readonly VITE_COUNTER_TIMING_DEMO?: string;
  readonly VITE_COUNTER_HOLD_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
