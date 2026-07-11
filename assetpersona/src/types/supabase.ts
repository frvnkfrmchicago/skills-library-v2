/** Supabase Database type definitions for the community platform */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'joined_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'reaction_counts'>;
        Update: Partial<Omit<Post, 'id' | 'author_id'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at'>;
        Update: Partial<Omit<Comment, 'id' | 'post_id' | 'author_id'>>;
      };
      reactions: {
        Row: Reaction;
        Insert: Omit<Reaction, 'id' | 'created_at'>;
        Update: never;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id'>>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, 'id' | 'created_at'>;
        Update: Partial<Omit<Lesson, 'id' | 'course_id'>>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, 'id'>;
        Update: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id'>>;
      };
      events: {
        Row: CalendarEvent;
        Insert: Omit<CalendarEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<CalendarEvent, 'id'>>;
      };
      levels: {
        Row: Level;
        Insert: Level;
        Update: Partial<Level>;
      };
    };
  };
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  level: number;
  points: number;
  role: 'member' | 'moderator' | 'admin';
  tier?: 'assetClass' | 'cohort' | 'insiders' | 'privateLessons';
  status?: 'active' | 'suspended';
  /** AP-PLATFORM-2026-05 — Profile Schema Agent 1 */
  services_interest?: 'hire' | 'speaking' | 'training' | 'learn' | 'marketing' | 'other' | null;
  onboarding_step?: number;
  email_opt_in?: boolean;
  email_subscribed_at?: string | null;
  /** Hides the user from the public completion ticker + leaderboards */
  faceless?: boolean;
  joined_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  body: string;
  media_urls: string[];
  category: string;
  pinned?: boolean;
  reaction_counts: { like: number; fire: number; heart: number };
  created_at: string;
  updated_at: string;
  /** Joined from profiles */
  author?: Profile;
  /** Comment count (aggregated) */
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  /** AP-COMMUNITY-2026-05 — moderation fields */
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  reject_reason?: string | null;
  /** Optional media attached to the comment (images / GIFs from Tenor) */
  media_urls?: string[];
  created_at: string;
  /** Joined from profiles */
  author?: Profile;
  /** Nested replies (one level) */
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: 'like' | 'fire' | 'heart';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  lesson_count: number;
  created_at: string;
  /** Computed client-side */
  completion_pct?: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  section: string;
  title: string;
  video_url: string | null;
  description: string | null;
  action_items: string[];
  sort_order: number;
  created_at: string;
  /** Joined from lesson_progress */
  completed?: boolean;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  host_id: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  join_url: string | null;
  rsvp_count: number;
  created_at: string;
  /** Joined from profiles */
  host?: Profile;
}

export interface Level {
  level: number;
  name: string;
  points_required: number;
  unlock_rule: string | null;
}
