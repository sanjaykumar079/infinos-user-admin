// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://alvkqnhltsdrufcyoueo.supabase.co";        // e.g. https://abcxyz.supabase.co
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdmtxbmhsdHNkcnVmY3lvdWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Mzc1NDUsImV4cCI6MjA4MDMxMzU0NX0.Sq4NaZo1kSTM6yTS9wWPGGlgBpps7ycErdA-u6_rDgo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
