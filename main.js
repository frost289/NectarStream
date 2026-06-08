import { supabase } from './lib/supabaseClient.js';
import { getUserRole } from './app/auth.js';
import { renderHome } from './app/home.js';
import { renderStudio } from './app/studio.js';
import { renderLogin } from './app/login.js';
import { registerPlay } from './app/analytics.js';

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
            container.innerHTML = `
                <div class="section">
                    <h1 class="section-title">Your Library</h1>
                    <p style="color: var(--text-muted);">Your saved songs, curated playlists, and followed artists will appear here.</p>
                </div>`;
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
    const songLabel = document.getElementById('current-song');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (!player || !songLabel) return;

    try {
        // Set audio stream sources and metadata values
        player.src = audioUrl;
        songLabel.innerText = title;
        player.load();
        
        // Execute dynamic non-blocking play audio thread
        await player.play();
        if (playPauseBtn) playPauseBtn.innerText = "⏸";

        // Register background stream view analytics loop asynchronously
        if (songId) {
            await registerPlay(songId);
        }

        // Build a backup runtime context queue from elements present on the page layout
        syncQueueFromDom(audioUrl);

    } catch (err) {
        console.error("Audio core configuration failure:", err);
        songLabel.innerText = "Playback error occurred";
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

/**
 * Parses out current layout cards to construct a fluid queue list natively
 */
function syncQueueFromDom(activeUrl) {
    const cards = document.querySelectorAll('.card');
    currentQueue = [];
    currentTrackIndex = -1;

    cards.forEach((card, idx) => {
        const clickAttr = card.getAttribute('onclick') || '';
        // Extract params safely out of the playSong execution pattern string
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

// ==========================================================================
// 5. TIMELINE CONTROLS & CONTINUOUS INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('global-audio-player');
    const progressBar = document.getElementById('progress-bar');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (player && progressBar) {
        // Sync progress timeline layout continuously during track advancement
        player.addEventListener('timeupdate', () => {
            if (player.duration) {
                progressBar.value = (player.currentTime / player.duration) * 100;
            }
        });

        // Allow users to scrub through the progress bar manually
        progressBar.addEventListener('input', () => {
            if (player.duration) {
                player.currentTime = (progressBar.value / 100) * player.duration;
            }
        });

        // Track has ended -> auto skip to next available song
        player.addEventListener('ended', () => {
            window.nextSong();
        });
    }

    // Catch system authentication state updates natively to intercept login changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log(`Supabase Global Session Identity Event: [${event}]`);
        if (event === 'SIGNED_IN') {
            window.loadPage('home');
        } else if (event === 'SIGNED_OUT') {
            window.loadPage('login');
        }
    });

    // Default entry loading routing on application initialization block
    window.loadPage('home');
});