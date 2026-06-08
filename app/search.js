import { supabase } from '../lib/supabaseClient.js';

export async function renderSearch() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <h1>Search</h1>
        <input type="text" id="search-input" placeholder="Search by title or genre...">
        <div id="search-results" class="grid"></div>
    `;

    const input = document.getElementById('search-input');
    input.addEventListener('input', async (e) => {
        const term = e.target.value;
        if (!term) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }

        // Search logic: check title OR genre
        const { data: results } = await supabase
            .from('songs')
            .select('*')
            .or(`title.ilike.%${term}%,genre.ilike.%${term}%`);

        renderResults(results);
    });
}

function renderResults(results) {
    const container = document.getElementById('search-results');
    if (!results || results.length === 0) {
        container.innerHTML = `<p>No matches found.</p>`;
        return;
    }
    container.innerHTML = results.map(song => `
        <div class="card">
            <img src="${song.cover_art_url}" alt="${song.title}">
            <h3>${song.title}</h3>
            <button onclick="playSong('${song.audio_url}', '${song.title}')">Play</button>
        </div>
    `).join('');
}