export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      content_items: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type: string;
          user_id: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      user_actions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      action_items: {
        Row: {
          id: string;
          action_id: string;
          item_id: string;
          properties: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          action_id: string;
          item_id: string;
          properties?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          action_id?: string;
          item_id?: string;
          properties?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
}
