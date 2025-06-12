export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
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
          description: string;
          image_url: string;
          category: string;
          attributes: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url: string;
          category: string;
          attributes?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string;
          category?: string;
          attributes?: Json;
          created_at?: string | null;
          updated_at?: string | null;
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
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
