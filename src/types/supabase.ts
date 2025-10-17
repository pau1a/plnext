export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PublicCommentsRow {
  id: string;
  slug: string;
  author: string;
  content: string;
  created_at: string;
}

export interface PublicCommentsInsert {
  id?: string;
  slug: string;
  author: string;
  content: string;
  created_at?: string;
}

export interface PublicCommentsUpdate {
  id?: string;
  slug?: string;
  author?: string;
  content?: string;
  created_at?: string;
}

export interface PublicPostsRow {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[] | null;
  inserted_at: string;
}

export interface PublicPostCommentCountsRow {
  slug: string;
  approved_count: number;
  last_approved_at: string | null;
  updated_at: string;
}

export interface ServiceContactMessagesRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  ip_hash: string;
  user_agent: string | null;
}

export interface ServiceContactMessagesInsert {
  id?: string;
  created_at?: string;
  name: string;
  email: string;
  message: string;
  ip_hash: string;
  user_agent?: string | null;
}

export interface ServiceContactMessagesUpdate {
  id?: string;
  created_at?: string;
  name?: string;
  email?: string;
  message?: string;
  ip_hash?: string;
  user_agent?: string | null;
}

export interface ServiceModerationCommentRow {
  id: string;
  slug: string;
  author_name: string;
  author_email: string | null;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  is_spam: boolean;
  ip_hash: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
}

export interface ServiceModerationCommentUpdate {
  status?: "pending" | "approved" | "rejected" | "spam";
  moderated_at?: string | null;
  updated_at?: string;
  is_spam?: boolean;
}

export interface ServiceModerationAuditLogRow {
  id: string;
  comment_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  actor_roles: string[];
  metadata: Json | null;
  created_at: string;
}

export interface ServiceModerationAuditLogInsert {
  id?: string;
  comment_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  actor_roles: string[];
  metadata?: Json | null;
  created_at?: string;
}

export interface ServiceModerationAuditLogUpdate {
  id?: string;
  comment_id?: string;
  action?: string;
  actor_id?: string;
  actor_name?: string;
  actor_roles?: string[];
  metadata?: Json | null;
  created_at?: string;
}

export type PublicSchema = {
  Tables: {
    comments: {
      Row: PublicCommentsRow;
      Insert: PublicCommentsInsert;
      Update: PublicCommentsUpdate;
      Relationships: never[];
    };
    posts: {
      Row: PublicPostsRow;
      Insert: never;
      Update: never;
      Relationships: never[];
    };
    post_comment_counts: {
      Row: PublicPostCommentCountsRow;
      Insert: never;
      Update: never;
      Relationships: never[];
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
};

export type PlSiteSchema = {
  Tables: {
    contact_messages: {
      Row: ServiceContactMessagesRow;
      Insert: ServiceContactMessagesInsert;
      Update: ServiceContactMessagesUpdate;
      Relationships: never[];
    };
    comments: {
      Row: ServiceModerationCommentRow;
      Insert: ServiceModerationCommentRow;
      Update: ServiceModerationCommentUpdate;
      Relationships: never[];
    };
    moderation_audit_log: {
      Row: ServiceModerationAuditLogRow;
      Insert: ServiceModerationAuditLogInsert;
      Update: ServiceModerationAuditLogUpdate;
      Relationships: never[];
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
};

export interface Database {
  __InternalSupabase?: {
    PostgrestVersion: "12";
  };
  public: PublicSchema;
}

export interface ServiceDatabase {
  __InternalSupabase?: {
    PostgrestVersion: "12";
  };
  pl_site: PlSiteSchema;
}
