import { supabase } from '../lib/supabaseClient.js';
import { getUserRole } from './auth.js';

export async function renderStudio() {
    const container = document.getElementById('app-container');
    const role = await getUserRole();
    const { data: { user } } = await supabase.auth.getUser();

    container.innerHTML = `<h1>Artist Studio (${role.toUpperCase()})</h1><div id="studio-content">Loading...</div>`;

    // 1. Fetch songs based on role
    let query = supabase.from('songs').select('*');
    
    // Artists only see their own songs (requires an artist_id column in 'songs' table)
    if (role === 'artist') {
        query = query.eq('artist_id', user.id);
    }

    const { data: songs, error } = await query;
    if (error) return container.innerHTML = `<p>Error: ${error.message}</p>`;

    // 2. Render UI
    const studioContent = document.getElementById('studio-content');
    studioContent.innerHTML = `
        ${role === 'admin' ? '<button id="add-song-btn">Add New Song</button>' : ''}
        <table class="studio-table">
            <thead>
                <tr><th>Title</th><th>Genre</th><th>Actions</th></tr>
            </thead>
            <tbody>
                ${songs.map(song => `
                    <tr>
                        <td>${song.title}</td>
                        <td>${song.genre || 'N/A'}</td>
                        <td>
                            <button class="edit-btn" onclick="editSong(${song.id})">Edit</button>
                            <button class="delete-btn" onclick="deleteSong(${song.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Global functions remain the same for CRUD, but ensure RLS allows these operations
window.deleteSong = async (id) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) alert("Delete failed: " + error.message);
    else renderStudio(); 
};

window.editSong = async (id) => {
    const newTitle = prompt("Enter new title:");
    if (!newTitle) return;
    const { error } = await supabase.from('songs').update({ title: newTitle }).eq('id', id);
    if (error) alert("Update failed: " + error.message);
    else renderStudio(); 
};