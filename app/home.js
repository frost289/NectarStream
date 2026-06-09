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

    // 1. Clear container and inject semantic grid layout scaffolds immediately
    container.innerHTML = `
        <div style="margin-bottom: 40px;">
            <h1>🎵 Welcome to NectarStream</h1>
            <p style="color: var(--text-muted); font-size: 16px;">Discover the best music from Malawi</p>
        </div>
        
        <div class="section">
            <h2>🆕 New Releases</h2>
            <div id="new-releases-grid" class="grid">
                <p style="color: var(--text-muted);">Loading tracks...</p>
            </div>
        </div>

        <div class="section">
            <h2>🔥 Trending Now</h2>
            <div id="trending-grid" class="grid">
                <p style="color: var(--text-muted);">Loading trending tracks...</p>
            </div>
        </div>

        <div class="section">
            <h2>⭐ Featured Picks</h2>
            <div id="featured-grid" class="grid">
                <p style="color: var(--text-muted);">Loading featured tracks...</p>
            </div>
        </div>
    `;

    // 2. Trigger asynchronous, non-blocking data lookups parallelly
    await Promise.all([
        loadNewReleases(),
        loadTrendingTracks(),
        loadFeaturedTracks()
    ]);
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
            .limit(8);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted);">No songs have been uploaded yet.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [New Releases Query]:", err.message);
        grid.innerHTML = `
            <p style="color: var(--danger); font-size: 14px;">
                ⚠️ Failed to load new releases
            </p>`;
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
            .limit(8);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted);">No trending tracks yet.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [Trending Query]:", err.message);
        grid.innerHTML = `
            <p style="color: var(--danger); font-size: 14px;">
                ⚠️ Failed to load trending tracks
            </p>`;
    }
}

/**
 * Fetches and displays featured tracks (is_featured = true)
 */
async function loadFeaturedTracks() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    try {
        const { data: songs, error } = await supabase
            .from(DB_CONFIG.table)
            .select('*')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) throw error;

        if (!songs || songs.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted);">No featured tracks available.</p>`;
            return;
        }

        grid.innerHTML = songs.map(song => buildTrackCardHtml(song)).join('');

    } catch (err) {
        console.error("Home View Error [Featured Query]:", err.message);
        grid.innerHTML = `
            <p style="color: var(--danger); font-size: 14px;">
                ⚠️ Failed to load featured tracks
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
    
    // Fallback placeholder image structure if database cover paths are empty or broken
    const coverUrl = song[DB_CONFIG.coverUrl] || 'https://via.placeholder.com/250/1a1a1a/1DB954?text=♪';

    // Format display metric values strings safely
    const playLabel = plays === 1 ? '1 play' : `${plays.toLocaleString()} plays`;

    // Return the literal component block utilizing the global playSong hook
    return `
        <div class="card" onclick="window.playSong('${audioUrl}', '${title.replace(/'/g, "\\'")}', '${id}')">
            <div class="card-img-container">
                <img src="${coverUrl}" alt="${title} Album Art" loading="lazy">
                <button class="play-hover-btn" onclick="event.stopPropagation(); window.playSong('${audioUrl}', '${title.replace(/'/g, "\\'")}', '${id}')">▶</button>
            </div>
            <h3>${title}</h3>
            <small>${artist}</small>
        </div>
    `;
}
