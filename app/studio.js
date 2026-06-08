import { supabase } from '../lib/supabaseClient.js';
import { getUserRole } from './auth.js';

export async function renderStudio() {
    const container = document.getElementById('app-container');
    container.innerHTML = `<p style="color: #b3b3b3;">Verifying dashboard credentials...</p>`;

    const role = await getUserRole();

    if (role !== 'admin' && role !== 'artist') {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h1 style="color: #d0021b;">Access Denied</h1>
                <p style="color: #b3b3b3; margin-top: 10px;">You must be an Artist or Admin to view the Studio.</p>
            </div>
        `;
        return;
    }

    if (role === 'admin') {
        await renderAdminDashboard(container);
    } else if (role === 'artist') {
        await renderArtistDashboard(container);
    }
}

async function renderAdminDashboard(container) {
    const { data: artists, error: artistErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'artist');

    if (artistErr) {
        container.innerHTML = `<p style="color:red;">Error syncing master artist index: ${artistErr.message}</p>`;
        return;
    }

    container.innerHTML = `
        <div class="studio-wrapper">
            <h1 style="margin-bottom: 10px; color: #FF6600;">System Administrator Studio</h1>
            <p style="color: #b3b3b3; margin-bottom: 30px;">Curator mode: Provision tracks, upload files to storage, and manage playlists.</p>
            
            <div style="background: #181818; padding: 25px; border-radius: 8px; border: 1px solid #282828; max-width: 600px; margin-bottom: 40px;">
                <h3 style="margin-bottom: 20px;">Upload & Deploy New Track</h3>
                <form id="upload-form" style="display: flex; flex-direction: column; gap: 15px;">
                    
                    <div>
                        <label style="display:block; margin-bottom: 5px; color:#b3b3b3;">Track Title</label>
                        <input type="text" id="track-title" placeholder="e.g., Midnight Melodies" required>
                    </div>

                    <div>
                        <label style="display:block; margin-bottom: 5px; color:#b3b3b3;">Assign to Creator Profile</label>
                        <select id="track-artist" required>
                            <option value="">-- Select an Artist Profile --</option>
                            ${artists.map(a => `<option value="${a.id}">${a.id}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label style="display:block; margin-bottom: 5px; color:#b3b3b3;">Audio Source File (.mp3)</label>
                        <input type="file" id="track-audio-file" accept="audio/mp3, audio/*" required style="padding: 8px; border: 1px dashed #444;">
                    </div>

                    <div>
                        <label style="display:block; margin-bottom: 5px; color:#b3b3b3;">Cover Art Image (.png, .jpg)</label>
                        <input type="file" id="track-cover-file" accept="image/*" style="padding: 8px; border: 1px dashed #444;">
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px; flex-direction: row;">
                        <input type="checkbox" id="track-featured" style="width:18px; height:18px; accent-color:#FF6600;">
                        <label for="track-featured" style="color: #fff; font-weight: bold; cursor:pointer; margin: 0;">Promote to Featured Carousel</label>
                    </div>

                    <button type="submit" id="upload-btn" style="margin-top: 10px; width: 100%;">Upload & Save Track</button>
                </form>
            </div>

            <h3 style="margin-bottom: 15px;">Live Global Track Inventory</h3>
            <div id="admin-inventory-target">Loading catalog records...</div>
        </div>
    `;

    document.getElementById('upload-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('upload-btn');
        btn.innerText = "Processing Assets...";
        btn.disabled = true;

        const title = document.getElementById('track-title').value.trim();
        const artistId = document.getElementById('track-artist').value;
        const isFeatured = document.getElementById('track-featured').checked;
        
        const audioFile = document.getElementById('track-audio-file').files[0];
        const coverFile = document.getElementById('track-cover-file').files[0];

        try {
            let audioUrl = '';
            let coverUrl = null;

            // 1. Upload audio file to 'songs' bucket
            if (audioFile) {
                const fileExt = audioFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${artistId}/${fileName}`;

                const { error: uploadAudioErr } = await supabase.storage
                    .from('songs')
                    .upload(filePath, audioFile);

                if (uploadAudioErr) throw new Error("Audio upload error: " + uploadAudioErr.message);

                // Get Public URL
                audioUrl = supabase.storage.from('songs').getPublicUrl(filePath).data.publicUrl;
            }

            // 2. Upload cover art file to 'covers' bucket
            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${artistId}/${fileName}`;

                const { error: uploadCoverErr } = await supabase.storage
                    .from('covers')
                    .upload(filePath, coverFile);

                if (uploadCoverErr) throw new Error("Cover image upload error: " + uploadCoverErr.message);

                // Get Public URL
                coverUrl = supabase.storage.from('covers').getPublicUrl(filePath).data.publicUrl;
            }

            // 3. Insert metadata records into your main songs data table
            const { error: dbErr } = await supabase.from('songs').insert([{
                title: title,
                artist_id: artistId,
                audio_url: audioUrl,
                cover_url: coverUrl,
                is_featured: isFeatured
            }]);

            if (dbErr) throw dbErr;
            
            alert("Track completely synced and deployed successfully!");
            document.getElementById('upload-form').reset();
            await loadAdminInventory();
        } catch (err) {
            console.error(err);
            alert("Deployment Process Failed: " + err.message);
        } finally {
            btn.innerText = "Upload & Save Track";
            btn.disabled = false;
        }
    };

    await loadAdminInventory();
}

async function loadAdminInventory() {
    const target = document.getElementById('admin-inventory-target');
    if (!target) return;

    const { data: songs, error } = await supabase
        .from('songs')
        .select('id, title, artist_id, plays, is_featured')
        .order('created_at', { ascending: false });

    if (error) {
        target.innerHTML = `<p style="color:red;">Failed to retrieve active index logs.</p>`;
        return;
    }

    if (songs.length === 0) {
        target.innerHTML = `<p style="color:#b3b3b3;">No songs cataloged on the network yet.</p>`;
        return;
    }

    target.innerHTML = `
        <table class="studio-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Artist ID Assignment</th>
                    <th>Streams</th>
                    <th>Status Pin</th>
                </tr>
            </thead>
            <tbody>
                ${songs.map(song => `
                    <tr>
                        <td style="font-weight:bold; color:#fff;">${song.title}</td>
                        <td style="font-size:13px; color:#b3b3b3; font-family:monospace;">${song.artist_id}</td>
                        <td><span style="background:#222; padding:4px 10px; border-radius:12px; color:#FF6600;">${song.plays || 0} plays</span></td>
                        <td>${song.is_featured ? '⭐ Featured' : '<span style="color:#444;">Standard</span>'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function renderArtistDashboard(container) {
    const { data: { session } } = await supabase.auth.getSession();
    const artistId = session.user.id;

    const { data: mySongs, error } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', artistId)
        .order('plays', { ascending: false });

    if (error) {
        container.innerHTML = `<p style="color:red;">Analytics compiler sync error: ${error.message}</p>`;
        return;
    }

    const totalPlays = mySongs.reduce((acc, current) => acc + (current.plays || 0), 0);
    const topTrack = mySongs[0]?.title || "No tracks released yet";

    container.innerHTML = `
        <div class="studio-wrapper">
            <h1 style="color: #FF6600;">Artist Analytics Space</h1>
            <p style="color: #b3b3b3; margin-bottom: 30px;">Metrics are updated continuously based on live listener streams.</p>
            
            <div style="display:flex; gap:20px; margin-bottom:35px; flex-wrap:wrap;">
                <div class="stats-card" style="min-width:200px;">
                    <small style="color:#b3b3b3; text-transform:uppercase; font-size:11px;">Gross Streams</small>
                    <h2 style="font-size:32px; color:#FFF; margin-top:5px;">${totalPlays}</h2>
                </div>
                <div class="stats-card" style="min-width:240px;">
                    <small style="color:#b3b3b3; text-transform:uppercase; font-size:11px;">Highest Performing Track</small>
                    <h2 style="font-size:20px; color:#FFF; margin-top:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topTrack}</h2>
                </div>
            </div>

            <h3 style="margin-bottom:15px;">Your Complete Catalog Engagement Matrix</h3>
            <table class="studio-table">
                <thead>
                    <tr>
                        <th>Track</th>
                        <th>Total Plays</th>
                        <th>Release Horizon (Date)</th>
                    </tr>
                </thead>
                <tbody>
                    ${mySongs.length === 0 ? `<tr><td colspan="3" style="color:#b3b3b3; text-align:center;">No catalog tracks detected for your profile yet.</td></tr>` : ''}
                    ${mySongs.map(song => `
                        <tr>
                            <td style="font-weight:bold; color:white;">${song.title}</td>
                            <td><strong style="color:#FF6600;">${song.plays || 0}</strong> plays</td>
                            <td style="color:#b3b3b3; font-size:14px;">${new Date(song.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}