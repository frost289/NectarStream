import { supabase } from '../../supabase.js'

export function initAudioPlayer() {
  if (document.getElementById('global-audio-player')) return;

  const playerContainer = document.createElement('div');
  playerContainer.id = 'global-audio-player';
  playerContainer.style.cssText = `
    position: fixed; bottom: 0; left: 0; width: 100%; height: 90px;
    background: #181818; border-top: 1px solid #282828; display: flex;
    align-items: center; justify-content: space-between; padding: 0 20px;
    box-sizing: border-box; color: white; z-index: 9999; visibility: hidden;
    transition: visibility 0.2s ease-in-out;
  `;

  playerContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px; width: 30%; min-width: 180px;">
      <img id="player-art" src="" style="width: 56px; height: 56px; border-radius: 4px; object-fit: cover; background: #282828;" />
      <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
        <div id="player-title" style="font-weight: bold; font-size: 0.95rem; margin-bottom: 2px;">Track Title</div>
        <div id="player-artist" style="color: #b3b3b3; font-size: 0.8rem;">Artist Name</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 40%; max-width: 500px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <button id="player-play-btn" style="background: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg id="play-icon" height="14" width="14" viewBox="0 0 24 24" fill="black"><polygon points="21.57 12 5.98 3 5.98 21 21.57 12"></polygon></svg>
          <svg id="pause-icon" height="14" width="14" viewBox="0 0 24 24" fill="black" style="display:none;"><rect x="5" y="5" width="4" height="14"></rect><rect x="15" y="5" width="4" height="14"></rect></svg>
        </button>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; width: 100%; font-size: 0.75rem; color: #b3b3b3;">
        <span id="player-time-current">0:00</span>
        <input type="range" id="player-progress" min="0" max="100" value="0" style="width: 100%; accent-color: #1DB954; cursor: pointer; height: 4px;" />
        <span id="player-time-duration">0:00</span>
      </div>
    </div>

    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; width: 30%;">
      <svg height="16" width="16" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M7 9v6h4l5 5V4l-5 5H7z"></path></svg>
      <input type="range" id="player-volume" min="0" max="1" step="0.01" value="0.7" style="width: 80px; accent-color: #1DB954; cursor: pointer; height: 4px;" />
    </div>

    <audio id="main-audio-element"></audio>
  `;

  document.body.appendChild(playerContainer);

  const audio = document.getElementById('main-audio-element');
  const playBtn = document.getElementById('player-play-btn');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const progress = document.getElementById('player-progress');
  const volume = document.getElementById('player-volume');
  const timeCurrent = document.getElementById('player-time-current');
  const timeDuration = document.getElementById('player-time-duration');

  let activeSongId = null;

  function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
  });

  // FIRE DB COUNTER UPDATE EVERY TIME TRACK COMMENCES PLAYBACK
  audio.addEventListener('play', async () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';

    if (activeSongId) {
      // Execute the RPC function safely on your database server
      await supabase.rpc('increment_stream', { song_id_param: activeSongId });
    }
  });

  audio.addEventListener('pause', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    timeCurrent.innerText = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    timeDuration.innerText = formatTime(audio.duration);
  });

  progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
  });

  volume.addEventListener('input', () => { audio.volume = volume.value; });

  // RECIEVE EVENTS FROM STREAMS CATALOG SELECTIONS
  window.addEventListener('nectar-play', (e) => {
    const { songId, audioUrl, title, artist, artUrl } = e.detail;

    playerContainer.style.visibility = 'visible';
    activeSongId = songId; // Track the current playing ID contextually

    document.getElementById('player-art').src = artUrl;
    document.getElementById('player-title').innerText = title;
    document.getElementById('player-artist').innerText = artist;

    audio.src = audioUrl;
    audio.load();
    audio.play().catch(err => console.log("Playback initialization halted contextually:", err));
  });
}