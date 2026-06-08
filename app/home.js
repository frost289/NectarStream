import { supabase } from '../lib/supabaseClient.js';

export async function renderHome() {
    const container = document.getElementById('app-container');
    container.innerHTML = '<h1>Loading...</h1>';
    
    // We target the 'songs' table as seen in your database screenshot
    const { data: songs, error } = await supabase
        .from('songs')
        .select('*');

    if (error) {
        container.innerHTML = `<h1>Database Error</h1><p>${error.message}</p>`;
        return;
    }

    if (!songs || songs.length === 0) {
        container.innerHTML = `<h1>Latest Releases</h1><p>No songs found in the database.</p>`;
        return;
    }

    // Render the cards using the keys from your screenshot (audio_url, cover_art_url)
    container.innerHTML = `
        <h1>Latest Releases</h1>
        <div class="grid">
            ${songs.map(song => `
                <div class="card">
                    <img src="${song.cover_art_url}" alt="${song.title}">
                    <h3>${song.title}</h3>
                    <button onclick="playSong('${song.audio_url}', '${song.title}')">Play</button>
                </div>
            `).join('')}
        </div>
    `;
}