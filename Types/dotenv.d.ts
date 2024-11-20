declare module 'dotenv' {
    export function config(options?: { path?: string; encoding?: string; debug?: boolean; silent?: boolean }): { parsed: Record<string, string> };
  }