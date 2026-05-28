const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail-safe check to make sure your environmental keys are loaded
if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Critical Error: Missing Supabase environment variables inside .env file.');
}

// Initialize the master administrative connection
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

module.exports = supabase;