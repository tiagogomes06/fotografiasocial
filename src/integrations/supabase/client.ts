// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://iomjazjwpcmosxinznyu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbWphemp3cGNtb3N4aW56bnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NDA5MTksImV4cCI6MjA0ODQxNjkxOX0.rIobeJ8241BJogg-s0sDzRx-f0D18tGMePF2it1CmgU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);