import { supabase } from '../lib/supabaseClient.js';

// ==========================================================================
// 1. DATABASE COLUMN CONFIGURATION
// If your Supabase 'songs' table uses different column names, change them here!
// ==========================================================================
const DB_CONFIG = {
    table: 'songs',
    id: 'id',
    title: 'title',
    artist: 'artist_name',   // Change to 'artist' or 'user_id' if needed
    audioUrl: 'audio_url',   // Your storage stream link column
    coverUrl: 'cover_url',   // Your image link column
    plays: 'plays'           // Change to 'play_count' or 'streams' if needed
};

/**
 * Main rendering router endpoint for the NectarStream Home Dashboard
 */
export async function renderHome() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // 1. Clear container and inject semantic grid layout scaffolds immediately with new sections
    container.innerHTML = `
        <h1>Listen Now</h1>
        
        <div class="section">
            <h2>Featured Masterpieces</h2>
            <div id="featured-releases-grid" class="grid">
                <p style="color: var(--text-muted);">Curating network spotlights...</p>
            </div>
        </div>

        <div class="section">
            <h2>Popular & Trending</h2>
            <div id="trending-grid" class="grid">
                <p style="color: var(--text-muted);">Analyzing streaming loops...</p>
            </div>
        </div>

        <div class="section">
            <h2>New Releases & Most Listened To</h2>
            <div id="new-releases-grid" class="grid">
                <p style="color: var(--text-muted);">Tuning network frequencies...</p>
            </div>
        </div>
    `;

    // 2. Trigger asynchronous, non-blocking data lookups parallelly
    await Promise.all([
        loadFeaturedTracks(),
        loadTrendingTracks(),
        loadNewReleases()
    ]);
}

/**
 * Fetches and displays promotional tracks flagged as featured
 */
async function loadFeaturedTracks() {
    const grid = document.getElementById('featured-releases-grid');
    if (!grid) return;

    try {
        const { data: songs, error } = await supabase
            .from(DB_CONFIG.table)
            .select('*')
            .eq('is_featured', true)
            .limit(6);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No promotional features spotlighted at the moment.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [Featured Query]:", err.message);
        grid.innerHTML = `<p style="color: var(--danger); font-size: 14px; grid-column: 1/-1;">Failed to load featured catalog.</p>`;
    }
}

/**
 * Fetches and displays tracks sorted by view / stream counts
 */
async function loadTrendingTracks() {
    const grid = document.getElementById('trending-grid');
    if (!grid) return;

    try {
        const { data: songs, error } = await supabase
            .from(DB_CONFIG.table)
            .select('*')
            .order(DB_CONFIG.plays, { ascending: false })
            .limit(6);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No trending tracks recorded yet.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [Trending Query]:", err.message);
        grid.innerHTML = `
            <p style="color: var(--danger); font-size: 14px; grid-column: 1/-1;">
                Failed to load trending tracks. Ensure your '${DB_CONFIG.plays}' column exists.
            </p>`;
    }
}

/**
 * Fetches and displays the most recently uploaded tracks
 */
async function loadNewReleases() {
    const grid = document.getElementById('new-releases-grid');
    if (!grid) return;

    try {
        const { data: songs, error } = await supabase
            .from(DB_CONFIG.table)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No songs have been uploaded to NectarStream yet.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [New Releases Query]:", err.message);
        grid.innerHTML = `
            <p style="color: var(--danger); font-size: 14px; grid-column: 1/-1;">
                Failed to load new releases. Verify 'created_at' exists in your table.
            </p>`;
    }
}

/**
 * Generates uniform, scannable markup matching your elegant music card CSS system
 */
function buildTrackCardHtml(song) {
    // Extract properties safely using config declarations
    const id = song[DB_CONFIG.id];
    const title = song[DB_CONFIG.title] || 'Untitled Track';
    const artist = song[DB_CONFIG.artist] || 'Unknown Creator';
    const audioUrl = song[DB_CONFIG.audioUrl] || '';
    const plays = song[DB_CONFIG.plays] || 0;
    const artistId = song['artist_id'] || '';
    
    // Fallback placeholder image structure if database cover paths are empty or broken
    const coverUrl = song[DB_CONFIG.coverUrl] || 'https://via.placeholder.com/250/1a1a1a/ffffff?text=NectarStream';

    // Format display metric values strings safely
    const playLabel = plays === 1 ? '1 play' : `${plays.toLocaleString()} plays`;

    // Return the component block utilizing global handlers with event propagation safety controls
    return `
        <div class="card" onclick="window.playSong('${audioUrl}', '${title.replace(/'/g, "\\'")}', '${id}')">
            <div class="card-img-container">
                <img src="${coverUrl}" alt="${title} Album Art" loading="lazy">
                <button class="play-hover-btn">▶</button>
            </div>
            <h3>${title}</h3>
            <small>${artist} • ${playLabel}</small>
            
            <div style="display: flex; justify-content: space-between; padding: 0 14px 14px 14px; margin-top: auto;">
                <span onclick="window.toggleFollowArtist('${artistId}', event)" style="font-size: 12px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'"><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 114.42"><defs><style>.cls-1{fill:#ee4856;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:#fff;}</style></defs><title>instagram-followers</title><path class="cls-1" d="M9.32,0H113.56a9.35,9.35,0,0,1,9.32,9.32V82.94a9.37,9.37,0,0,1-9.32,9.32H83.84L67.68,111.32a8.17,8.17,0,0,1-12.82,0L39,92.26H9.32A9.36,9.36,0,0,1,0,82.94V9.32A9.34,9.34,0,0,1,9.32,0Z"/><path class="cls-2" d="M46.47,49.89H76.41a11,11,0,0,1,11,11v4.29a1.35,1.35,0,0,1-1.35,1.34H36.83a1.35,1.35,0,0,1-1.35-1.34V60.88a11,11,0,0,1,11-11Zm15-32.33A14.22,14.22,0,1,1,47.22,31.78,14.22,14.22,0,0,1,61.44,17.56Z"/></svg> Follow</span>
                <span onclick="window.toggleLikeTrack('${id}', event)" style="font-size: 12px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'"><?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 104.19" style="enable-background:new 0 0 122.88 104.19" xml:space="preserve"><g><path d="M62.63,6.25c0.56-2.85,2.03-4.68,4.04-5.61c1.63-0.76,3.54-0.83,5.52-0.31c1.72,0.45,3.53,1.37,5.26,2.69 c4.69,3.57,9.08,10.3,9.64,18.71c0.17,2.59,0.12,5.35-0.12,8.29c-0.16,1.94-0.41,3.98-0.75,6.1h19.95l0.09,0.01 c3.24,0.13,6.38,0.92,9.03,2.3c2.29,1.2,4.22,2.84,5.56,4.88c1.38,2.1,2.13,4.6,2.02,7.46c-0.08,2.12-0.65,4.42-1.81,6.87 c0.66,2.76,0.97,5.72,0.54,8.32c-0.36,2.21-1.22,4.17-2.76,5.63c0.08,3.65-0.41,6.71-1.39,9.36c-1.01,2.72-2.52,4.98-4.46,6.98 c-0.17,1.75-0.45,3.42-0.89,4.98c-0.55,1.96-1.36,3.76-2.49,5.35l0,0c-3.4,4.8-6.12,4.69-10.43,4.51c-0.6-0.02-1.24-0.05-2.24-0.05 l-39.03,0c-3.51,0-6.27-0.51-8.79-1.77c-2.49-1.25-4.62-3.17-6.89-6.01l-0.58-1.66V47.78l1.98-0.53 c5.03-1.36,8.99-5.66,12.07-10.81c3.16-5.3,5.38-11.5,6.9-16.51V6.76L62.63,6.25L62.63,6.25L62.63,6.25z M4,43.02h29.08 c2.2,0,4,1.8,4,4v53.17c0,2.2-1.8,4-4,4l-29.08,0c-2.2,0-4-1.8-4-4V47.02C0,44.82,1.8,43.02,4,43.02L4,43.02L4,43.02z M68.9,5.48 c-0.43,0.2-0.78,0.7-0.99,1.56V20.3l-0.12,0.76c-1.61,5.37-4.01,12.17-7.55,18.1c-3.33,5.57-7.65,10.36-13.27,12.57v40.61 c1.54,1.83,2.96,3.07,4.52,3.85c1.72,0.86,3.74,1.2,6.42,1.2l39.03,0c0.7,0,1.6,0.04,2.45,0.07c2.56,0.1,4.17,0.17,5.9-2.27v-0.01 c0.75-1.06,1.3-2.31,1.69-3.71c0.42-1.49,0.67-3.15,0.79-4.92l0.82-1.75c1.72-1.63,3.03-3.46,3.87-5.71 c0.86-2.32,1.23-5.11,1.02-8.61l-0.09-1.58l1.34-0.83c0.92-0.57,1.42-1.65,1.63-2.97c0.34-2.1-0.02-4.67-0.67-7.06l0.21-1.93 c1.08-2.07,1.6-3.92,1.67-5.54c0.06-1.68-0.37-3.14-1.17-4.35c-0.84-1.27-2.07-2.31-3.56-3.09c-1.92-1.01-4.24-1.59-6.66-1.69v0.01 l-26.32,0l0.59-3.15c0.57-3.05,0.98-5.96,1.22-8.72c0.23-2.7,0.27-5.21,0.12-7.49c-0.45-6.72-3.89-12.04-7.56-14.83 c-1.17-0.89-2.33-1.5-3.38-1.77C70.04,5.27,69.38,5.26,68.9,5.48L68.9,5.48L68.9,5.48z"/></g></svg>
                Like</span>
            </div>
        </div>
    `;
}