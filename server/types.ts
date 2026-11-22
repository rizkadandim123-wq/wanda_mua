export interface AssetsFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface R2ObjectBodyLike {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: {
    contentType?: string;
  };
  size?: number;
}

export interface R2BucketLike {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    }
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

export interface ServerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SESSION_SECRET?: string;
  MEDIA_BUCKET?: R2BucketLike;
  R2_PUBLIC_URL?: string;
  ASSETS?: AssetsFetcher;
}

export interface AdminProfileSession {
  id: string;
  username: string;
  display_name: string;
  role: 'owner' | 'admin';
}

export interface SessionPayload extends AdminProfileSession {
  exp: number;
}
