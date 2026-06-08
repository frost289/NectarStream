import { supabase } from '../lib/supabaseClient.js';

export async function getUserRole() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
        console.log("Auth Status: No active user session.");
        return 'guest';
    }

    const userId = session.user.id;
    console.log("Auth Status: User logged in. UID:", userId);

    // Using .maybeSingle() prevents crashes if 0 or multiple rows exist
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

    if (profileError) {
        console.error("Database Error reading profiles table:", profileError.message);
        return 'user'; 
    }

    if (!profile) {
        console.warn("Database Warning: No matching row found in profiles table for UID:", userId);
        return 'user';
    }

    console.log("Success: Role successfully parsed ->", profile.role);
    return profile.role;
}