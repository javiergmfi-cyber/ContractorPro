import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Note: In production, you would use Supabase for:
// - User authentication
// - Invoice storage
// - Profile storage
// - File storage for logos and PDFs

// For now, we're using local Zustand stores with persistence
