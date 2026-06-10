import { supabase } from './lib/supabaseClient.js';
import { getUserRole } from './app/auth.js';
import { renderHome } from './app/home.js';
import { renderStudio } from './app/studio.js';
import { renderLogin } from './app/login.js';
import { registerPlay } from './app/analytics.js';
import { renderLibrary } from './app/library.js';

// ==========================================================================
// 1. GLOBAL STATE TRACKERS (Queue & Current Playback Engine)
// ==========================================================================
let currentQueue = [];
let currentTrackIndex = -1;

// ==========================================================================
// 2. CENTRAL SPA ROUTER ENGINE
// ==========================================================================
window.loadPage = async function(page) {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Fetch the live user role dynamically on every page switch event
    const role = await getUserRole();
    console.log(`Router: Navigating to [${page}] | Verified Role Context: [${role}]`);

    // Synchronize Sidebar active link states
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    const activeNav = Array.from(document.querySelectorAll('.sidebar-menu li'))
                           .find(li => li.getAttribute('onclick')?.includes(`'${page}'`));
    if (activeNav) activeNav.classList.add('active');
    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    // Route Rendering Switchboard
    switch(page) {
        case 'home':
            await renderHome();
            break;
            
        case 'studio':
            await renderStudio();
            break;
            
        case 'login':
            await renderLogin();
            break;

        case 'search':
            container.innerHTML = `
                <div class="section">
                    <h1 class="section-title">Search</h1>
                    <input type="search" placeholder="Search for tracks, artists, or albums..." style="max-width: 500px;">
                    <p style="color: var(--text-muted); margin-top: 20px;">Type above to scour the NectarStream network catalogs.</p>
                </div>`;
            break;

        case 'library':
            // FIX: Successfully routing to the dynamic user collection compiler
            await renderLibrary();
            break;

        case 'literature':
            container.innerHTML = `
                <div class="section">
                    <h1 class="section-title">Literature Portal</h1>
                    <p style="color: var(--text-muted);">Explore lyrics, artist profiles, documentations, and musical educational guides.</p>
                </div>`;
            break;

        default:
            await renderHome();
    }
};

// ==========================================================================
// 3. AUTHENTICATION LOGOUT ROUTINE
// ==========================================================================
window.logout = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        alert("Logged out of session completely.");
        window.loadPage('login');
    } catch (err) {
        console.error("Logout runtime execution fault:", err.message);
        alert("Logout failed: " + err.message);
    }
};

// ==========================================================================
// 4. MUSIC STREAMING PERSISTENT CONTROLLER
// ==========================================================================
window.playSong = async function(audioUrl, title, songId = null) {
    const player = document.getElementById('global-audio-player');
    if (!player) return;

    try {
        player.src = audioUrl;
        player.load();
        
        await player.play();
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) playPauseBtn.innerText = "⏸";

        if (songId) {
            await registerPlay(songId);
        }

        syncQueueFromDom(audioUrl);
        updatePlayerMetadataLayout(audioUrl, title);

    } catch (err) {
        console.error("Audio core configuration failure:", err);
        const songLabel = document.getElementById('current-song');
        if (songLabel) songLabel.innerText = "Playback error occurred";
    }
};

window.togglePlay = function() {
    const player = document.getElementById('global-audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (!player) return;

    if (player.paused) {
        player.play();
        if (playPauseBtn) playPauseBtn.innerText = "⏸";
    } else {
        player.pause();
        if (playPauseBtn) playPauseBtn.innerText = "▶";
    }
};

window.nextSong = function() {
    if (currentQueue.length === 0 || currentTrackIndex === -1) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % currentQueue.length;
    const nextTrack = currentQueue[currentTrackIndex];
    window.playSong(nextTrack.url, nextTrack.title);
};

window.prevSong = function() {
    if (currentQueue.length === 0 || currentTrackIndex === -1) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + currentQueue.length) % currentQueue.length;
    const prevTrack = currentQueue[currentTrackIndex];
    window.playSong(prevTrack.url, prevTrack.title);
};

function syncQueueFromDom(activeUrl) {
    const cards = document.querySelectorAll('.card');
    currentQueue = [];
    currentTrackIndex = -1;

    cards.forEach((card, idx) => {
        const clickAttr = card.getAttribute('onclick') || '';
        const matches = clickAttr.match(/playSong\('(.*?)',\s*'(.*?)'/);
        
        if (matches && matches[1] && matches[2]) {
            const trackObj = { url: matches[1], title: matches[2] };
            currentQueue.push(trackObj);
            
            if (trackObj.url === activeUrl) {
                currentTrackIndex = idx;
            }
        }
    });
}

function updatePlayerMetadataLayout(audioUrl, title) {
    const songLabel = document.getElementById('current-song');
    const artistLabel = document.getElementById('player-artist');
    const coverImg = document.getElementById('player-cover');
    
    if (songLabel) songLabel.innerText = title;
    
    const cards = document.querySelectorAll('.card');
    let foundMatch = false;
    
    cards.forEach(card => {
        const clickAttr = card.getAttribute('onclick') || '';
        if (clickAttr.includes(audioUrl)) {
            const imgEl = card.querySelector('img');
            const artistEl = card.querySelector('small');
            
            if (imgEl && coverImg) coverImg.src = imgEl.src;
            if (artistEl && artistLabel) artistLabel.innerText = artistEl.innerText;
            foundMatch = true;
        }
    });
    
    if (!foundMatch) {
        if (coverImg) coverImg.src = 'https://via.placeholder.com/56';
        if (artistLabel) artistLabel.innerText = 'Unknown Artist';
    }
}

function formatTimelineStamp(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==========================================================================
// 4B. SOCIAL INTERACTIONS & CURATION HANDLERS (New Ecosystem Additions)
// ==========================================================================
window.toggleLikeTrack = async function(trackId, event) {
    if (event) event.stopPropagation(); // Avoid firing playSong card clicks
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in to like tracks!");

    try {
        const { data: existingLike } = await supabase.from('likes').select('*').eq('user_id', user.id).eq('track_id', trackId).maybeSingle();
        
        if (existingLike) {
            await supabase.from('likes').delete().eq('id', existingLike.id);
            alert("Removed from liked tracks.");
        } else {
            await supabase.from('likes').insert({ user_id: user.id, track_id: trackId });
            alert("Added to liked tracks!");
        }
    } catch (err) {
        console.error("Like interaction error:", err.message);
    }
};

window.toggleFollowArtist = async function(artistId, event) {
    if (event) event.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in to follow artists!");

    try {
        const { data: existingFollow } = await supabase.from('follows').select('*').eq('user_id', user.id).eq('artist_id', artistId).maybeSingle();
        
        if (existingFollow) {
            await supabase.from('follows').delete().eq('id', existingFollow.id);
            alert("Unfollowed artist.");
        } else {
            await supabase.from('follows').insert({ user_id: user.id, artist_id: artistId });
            alert("Following artist!");
        }
    } catch (err) {
        console.error("Follow interaction error:", err.message);
    }
};

window.createAdminPlaylist = async function(title) {
    const role = await getUserRole();
    if (role !== 'admin') return alert("Access Denied: Only Admins can build system playlists.");

    const { data: { user } } = await supabase.auth.getUser();
    try {
        const { data, error } = await supabase.from('playlists').insert({
            title: title,
            created_by: user.id,
            is_admin_curated: true
        }).select().single();

        if (error) throw error;
        alert(`Playlist "${data.title}" successfully launched across NectarStream!`);
        window.loadPage('studio');
    } catch (err) {
        alert("Curation fault: " + err.message);
    }
};

// ==========================================================================
// 5. TIMELINE CONTROLS & CONTINUOUS INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('global-audio-player');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeText = document.getElementById('current-time');
    const totalDurationText = document.getElementById('total-duration');
    const volumeSlider = document.getElementById('volume-slider');

    if (player && progressBar) {
        player.addEventListener('timeupdate', () => {
            if (player.duration) {
                progressBar.value = (player.currentTime / player.duration) * 100;
                if (currentTimeText) currentTimeText.textContent = formatTimelineStamp(player.currentTime);
            }
        });

        player.addEventListener('loadedmetadata', () => {
            if (totalDurationText) totalDurationText.textContent = formatTimelineStamp(player.duration);
        });

        progressBar.addEventListener('input', () => {
            if (player.duration) {
                player.currentTime = (progressBar.value / 100) * player.duration;
            }
        });

        player.addEventListener('ended', () => {
            window.nextSong();
        });
    }

    if (volumeSlider && player) {
        volumeSlider.addEventListener('input', () => {
            player.volume = volumeSlider.value / 100;
            const volumeIcon = document.getElementById('volume-icon');
            if (volumeIcon) {
                if (player.volume === 0) volumeIcon.innerText = "🔇";
                else if (player.volume < 0.5) volumeIcon.innerText = "🔉";
                else volumeIcon.innerText = "🔊";
            }
        });
    }

    supabase.auth.onAuthStateChange((event, session) => {
        console.log(`Supabase Global Session Identity Event: [${event}]`);
        if (event === 'SIGNED_IN') {
            window.loadPage('home');
        } else if (event === 'SIGNED_OUT') {
            window.loadPage('login');
        }
    });

    window.loadPage('home');
});

window.toggleMobileMenu = function() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('mobile-open');
};