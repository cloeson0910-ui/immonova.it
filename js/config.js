const SUPABASE_URL = "https://bpzzmitmbavcmcasswbu.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_YySRrYs6VqiGLmP9958PjA_dUM6MDU8";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
