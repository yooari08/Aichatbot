/** Type shims for Supabase Edge Functions (Deno `jsr:` / `npm:` imports). */

declare const Deno: {
  serve: (handler: (request: Request) => Response | Promise<Response>) => void
  env: {
    get(key: string): string | undefined
  }
}

declare module 'jsr:@supabase/supabase-js@2.49.8' {
  export * from '@supabase/supabase-js'
}

declare module 'npm:hono' {
  export class Hono {
    use(path: string, ...middleware: unknown[]): void
    get(path: string, handler: (c: { json: (body: unknown) => Response }) => Response): void
    fetch: (request: Request) => Response | Promise<Response>
  }
}

declare module 'npm:hono/cors' {
  export function cors(options: Record<string, unknown>): unknown
}

declare module 'npm:hono/logger' {
  export function logger(log: (...args: unknown[]) => void): unknown
}
