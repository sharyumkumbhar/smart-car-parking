// ===============================
// Supabase Configuration
// ===============================

const SUPABASE_URL = "https://yokdshtjbjlhqmmrnpxh.supabase.co";

const SUPABASE_KEY = "sb_publishable_2ZDoGT6xIclKRzqbE78Vnw_Uwp7BRdK";

// Create Supabase client
const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Check connection
async function testConnection() {

    try {

        const { data, error } = await sb
            .from("cars")
            .select("*")
            .limit(1);

        if (error) {
            alert("❌ Connection Error: " + error.message);
            console.log(error);
        } else {
            alert("✅ Supabase Connected Successfully!");
            console.log(data);
        }

    } catch (err) {
        alert("❌ " + err.message);
        console.log(err);
    }

}

window.onload = testConnection;
