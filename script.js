const SUPABASE_URL = "https://yokdshtjbjlhqmmrnpxh.supabase.co";

const SUPABASE_KEY = "sb_publishable_2ZDoGT6xIclKRzqbE78Vnw_Uwp7BRdK";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

alert("Supabase Connected Successfully!");
