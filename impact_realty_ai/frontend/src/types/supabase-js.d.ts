declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
  }

  export interface Session {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
  }

  export interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    };
    error: any;
  }

  // Add other commonly used types as needed
  export type Database = Record<string, any>;
}
