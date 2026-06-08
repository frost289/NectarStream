import { renderHome } from './app/home.js';
import { renderLiterature } from './app/literature.js';
import { renderSearch } from './app/search.js';
import { renderLibrary } from './app/library.js';
import { renderStudio } from './app/studio.js';
import { renderLogin } from './app/login.js';
import { getUserRole } from './app/auth.js'; 
import { supabase } from './lib/supabaseClient.js';

// Global Player Elements
const audioPlayer = document.getElementById('global-audio-player');
const playBtn = document.getElementById('play-pause-btn');
const songLabel = document.getElementById('current-song');

// --- GLOBAL ROUTER ---
window.loadPage = async (page) => {
    const container = document.getElementById('app-container');
    container.innerHTML = `<h1>Loading...</h1>`;
    
    try {
        switch(page) {
            case 'home':
                await renderHome();
                break;
            case 'literature':
                await renderLiterature();
                break;
            case 'search':
                await renderSearch();
                break;
            case 'library':
                await renderLibrary();
                break;
            case 'login':
                await renderLogin();
                break;
            case 'studio':
                const role = await getUserRole();
                if (role === 'admin' || role === 'artist') {
                    await renderStudio();
                } else {
                    container.innerHTML = `<h1>Access Denied</h1><p>You must be an Artist or Admin to view the Studio.</p>`;
                }
                break;
            default:
                container.innerHTML = `<h1>Welcome to NectarStream</h1>`;
        }
    } catch (err) {
        console.error("Page Load Error:", err);
        container.innerHTML = `<h1>Error</h1><p>Failed to load page: ${err.message}</p>`;
    }
};

// --- AUTH UTILITY ---
window.logout = async () => {
    await supabase.auth.signOut();
    alert("Logged out successfully.");
    loadPage('home');
};

// --- AUDIO PLAYER LOGIC ---
window.playSong = (audioUrl, title) => {
    songLabel.innerText = title;
    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(e => console.error("Playback failed:", e));
    updatePlayButton(true);
};

window.togglePlay = () => {
    if (!audioPlayer.src) return; 
    if (audioPlayer.paused) {
        audioPlayer.play();
        updatePlayButton(true);
    } else {
        audioPlayer.pause();
        updatePlayButton(false);
    }
};

window.prevSong = () => console.log("Previous song");
window.nextSong = () => console.log("Next song");

function updatePlayButton(isPlaying) {
    if (playBtn) playBtn.innerText = isPlaying ? "⏸" : "⏯";
}

window.addEventListener('DOMContentLoaded', () => loadPage('home'));