import { supabase } from '../lib/supabaseClient.js';

/**
 * Safely fetches the logged-in user's role without causing 406 coercion faults
 */
export async function getUserRole() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) return 'guest';

        // Using .maybeSingle() avoids throwing a 406 error if a row doesn't exist yet
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle(); 

        if (error) {
            console.error("Database Error reading profile:", error.message);
            return 'guest';
        }

        if (!data) {
            console.warn(`Database Warning: No matching row found in profiles table for UID: ${session.user.id}`);
            return 'guest';
        }

        return data.role || 'guest';
    } catch (err) {
        console.error("Auth System Exception:", err);
        return 'guest';
    }
}