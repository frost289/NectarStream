import { supabase } from '../lib/supabaseClient.js';

/**
 * Automatically increments the play counter for a song row.
 * Kicks off your "Most Played" dynamic sorting.
 */
export async function registerPlay(songId) {
    if (!songId) return;
    try {
        const { error } = await supabase.rpc('increment_plays', { song_row_id: songId });
        if (error) throw error;
        console.log(`Analytics: Play registered for song ${songId}`);
    } catch (err) {
        console.error("Analytics failed to record play tracker:", err.message);
    }
}