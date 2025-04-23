// Type definitions for Deno Edge Functions

// Deno namespace declaration
declare namespace Deno {
  // Environment variables
  export namespace env {
    export function get(key: string): string | undefined;
    export function set(key: string, value: string): void;
    export function toObject(): Record<string, string>;
  }
  
  // Serve HTTP
  export function serve(handler: (request: Request) => Response | Promise<Response>, options?: { port?: number, hostname?: string }): void;
  
  export const errors: {
    NotFound: Error;
    PermissionDenied: Error;
    ConnectionRefused: Error;
    ConnectionReset: Error;
    ConnectionAborted: Error;
    NotConnected: Error;
    AddrInUse: Error;
    AddrNotAvailable: Error;
    BrokenPipe: Error;
    AlreadyExists: Error;
    InvalidData: Error;
    TimedOut: Error;
    Interrupted: Error;
    WriteZero: Error;
    UnexpectedEof: Error;
    BadResource: Error;
    Busy: Error;
  };

  // File system API
  export function readTextFile(path: string): Promise<string>;
  export function writeTextFile(path: string, data: string): Promise<void>;
  
  // Utilities
  export function exit(code?: number): never;
}

// Declare the HTTP server module
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
    signal?: AbortSignal;
  }

  export function serve(handler: (request: Request) => Response | Promise<Response>, options?: Omit<ServeInit, "handler">): void;
  export function serve(options: ServeInit): void;
}

// Declare the Supabase JS module
declare module "https://esm.sh/@supabase/supabase-js@2.21.0" {
  export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
      fetch?: typeof fetch;
    };
    db?: {
      schema?: string;
    };
    realtime?: {
      channels?: Array<{
        name: string;
        opts?: {
          config?: {
            broadcast?: {
              self?: boolean;
            };
            presence?: {
              key?: string;
            };
          };
        };
      }>;
    };
  }

  export interface PostgrestResponse<T> {
    data: T | null;
    error: PostgrestError | null;
    count: number | null;
    status: number;
    statusText: string;
  }

  export interface PostgrestError extends Error {
    message: string;
    details: string;
    hint: string;
    code: string;
  }

  export interface User {
    id: string;
    email?: string;
    app_metadata: {
      provider?: string;
      [key: string]: any;
    };
    user_metadata: {
      [key: string]: any;
    };
    aud: string;
    confirmation_sent_at?: string;
    confirmed_at?: string;
    created_at: string;
    updated_at?: string;
    last_sign_in_at?: string;
    role?: string;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;

  export interface SupabaseClient {
    from<T = any>(table: string): QueryBuilder<T>;
    rpc<T = any>(fn: string, params?: any): Promise<PostgrestResponse<T>>;
    auth: {
      signUp(credentials: { email: string; password: string }): Promise<{ user: User | null; session: any | null; data: User | null; error: PostgrestError | null }>;
      signIn(credentials: { email: string; password: string }): Promise<{ user: User | null; session: any | null; data: User | null; error: PostgrestError | null }>;
      signOut(): Promise<{ error: PostgrestError | null }>;
      getUser(): Promise<{ user: User | null; data: User | null; error: PostgrestError | null }>;
      getUser(jwt: string): Promise<{ user: User | null; data: User | null; error: PostgrestError | null }>;
    };
  }

  export interface QueryBuilder<T> {
    select(columns?: string): Query<T>;
    insert(values: Partial<T> | Partial<T>[], options?: { returning?: string }): MutationQuery<T>;
    upsert(values: Partial<T> | Partial<T>[], options?: { onConflict?: string; returning?: string }): MutationQuery<T>;
    update(values: Partial<T>, options?: { returning?: string }): MutationQuery<T>;
    delete(options?: { returning?: string }): MutationQuery<T>;
  }

  export interface Query<T> {
    eq(column: string, value: any): Query<T>;
    neq(column: string, value: any): Query<T>;
    gt(column: string, value: any): Query<T>;
    gte(column: string, value: any): Query<T>;
    lt(column: string, value: any): Query<T>;
    lte(column: string, value: any): Query<T>;
    is(column: string, value: any): Query<T>;
    in(column: string, values: any[]): Query<T>;
    contains(column: string, value: any): Query<T>;
    containedBy(column: string, value: any): Query<T>;
    range(column: string, fromValue: any, toValue: any): Query<T>;
    rangeLt(column: string, range: any): Query<T>;
    rangeGt(column: string, range: any): Query<T>;
    rangeGte(column: string, range: any): Query<T>;
    rangeLte(column: string, range: any): Query<T>;
    rangeAdjacent(column: string, range: any): Query<T>;
    overlaps(column: string, value: any): Query<T>;
    textSearch(column: string, query: string, options?: { config?: string }): Query<T>;
    like(column: string, pattern: string): Query<T>;
    ilike(column: string, pattern: string): Query<T>;
    filter(column: string, operator: string, value: any): Query<T>;
    match(query: Record<string, any>): Query<T>;
    or(filters: string): Query<T>;
    and(filters: string): Query<T>;
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): Query<T>;
    limit(count: number): Query<T>;
    offset(count: number): Query<T>;
    select(columns?: string): Query<T>;
    maybeSingle(): Promise<PostgrestResponse<T>>;
    single(): Promise<PostgrestResponse<T>>;
    csv(): Promise<PostgrestResponse<string>>;
    then<TResult1 = PostgrestResponse<T>>(
      onfulfilled?: (value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1>;
  }

  export interface MutationQuery<T> {
    select(columns?: string): Query<T>;
    eq(column: string, value: any): MutationQuery<T>;
    neq(column: string, value: any): MutationQuery<T>;
    gt(column: string, value: any): MutationQuery<T>;
    gte(column: string, value: any): MutationQuery<T>;
    lt(column: string, value: any): MutationQuery<T>;
    lte(column: string, value: any): MutationQuery<T>;
    is(column: string, value: any): MutationQuery<T>;
    in(column: string, values: any[]): MutationQuery<T>;
    match(query: Record<string, any>): MutationQuery<T>;
    single(): Promise<PostgrestResponse<T>>;
    maybeSingle(): Promise<PostgrestResponse<T>>;
    then<TResult1 = PostgrestResponse<T>>(
      onfulfilled?: (value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1>;
  }

  // Add URLSearchParams iterator for Object.fromEntries compatibility
  interface URLSearchParams {
    [Symbol.iterator](): IterableIterator<[string, string]>;
  }
}
