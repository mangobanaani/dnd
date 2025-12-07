export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "dm" | "player" | "both";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  default_role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  dm_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: "dm" | "player";
  joined_at: string;
}

export interface Character {
  id: string;
  campaign_id: string;
  player_id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp_current: number;
  hp_max: number;
  ac: number;
  // ... more character fields
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Campaign, "id" | "created_at" | "updated_at">>;
      };
      campaign_members: {
        Row: CampaignMember;
        Insert: Omit<CampaignMember, "id" | "joined_at">;
        Update: Partial<Omit<CampaignMember, "id" | "joined_at">>;
      };
      characters: {
        Row: Character;
        Insert: Omit<Character, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Character, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
