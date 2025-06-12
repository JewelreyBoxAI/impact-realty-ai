declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    email: string;
    [key: string]: any;
  }
  // other types can be added as needed
}
