import { supabase } from '../../supabase.js'

export async function renderHome() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user || null

  // 1. Fetch songs catalog data AND include the matching likes array records
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select(`
      id, title, genre, audio_url, cover_art_url, artist_id, stream_count,
      profiles ( username ),
      likes ( id )
    `)
    .order('created_at', { ascending: false })

  if (songError) {
    console.error("Supabase relation fetch error details:", songError)
    return `<div style="padding:40px; text-align:center; color:#ff5e5e;"><h3>Failed to load music feed</h3><p style="color:#888; font-size:0.85rem;">${songError.message}</p></div>`
  }

  // 2. Map the active user's current liked status
  let userLikes = []
  if (user) {
    const { data: likes } = await supabase
      .from('likes')
      .select('song_id')
      .eq('user_id', user.id)
    if (likes) userLikes = likes.map(l => l.song_id)
  }

  if (!songs || songs.length === 0) {
    return `<div style="padding:60px; text-align:center; color:#b3b3b3;"><h2 style="color:white;">Welcome to NectarStream</h2></div>`
  }

  const uniqueGenres = ['All', ...new Set(songs.map(s => s.genre?.trim()).filter(Boolean))]

  const cardsHtml = songs.map(song => {
    const artistName = song.profiles?.username || "Unknown Creator"
    const songGenre = song.genre?.trim() || 'Single'
    const isLiked = userLikes.includes(song.id)
    const streams = song.stream_count || 0
    const totalLikes = song.likes ? song.likes.length : 0 // Compute overall total counts cleanly

    return `
      <div class="song-card" 
           data-id="${song.id}"
           data-audio="${song.audio_url}" 
           data-title="${song.title.toLowerCase()}" 
           data-artist="${artistName.toLowerCase()}" 
           data-genre="${songGenre.toLowerCase()}"
           data-display-title="${song.title}"
           data-display-artist="${artistName}"
           data-art="${song.cover_art_url}"
           style="background: #181818; padding: 16px; border-radius: 8px; cursor: pointer; transition: background 0.3s ease; display: flex; flex-direction: column; gap: 12px; position: relative;">
        
        <div style="position: relative; width: 100%; padding-top: 100%; border-radius: 6px; overflow: hidden; background: #282828;">
          <img src="${song.cover_art_url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" />
          
          <div class="play-overlay" style="position: absolute; bottom: 8px; right: 8px; background: #1DB954; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
            <svg height="16" width="16" viewBox="0 0 24 24" fill="white"><polygon points="21.57 12 5.98 3 5.98 21 21.57 12"></polygon></svg>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="overflow: hidden; flex: 1;">
            <h4 style="color: white; margin: 0 0 4px 0; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</h4>
            <p style="color: #b3b3b3; margin: 0; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${artistName}</p>
            
            <div style="display:flex; align-items:center; gap: 10px; margin-top:8px;">
              <span style="background: #282828; color: #1DB954; font-size: 0.7rem; font-weight: bold; padding: 2px 8px; border-radius: 12px;">${songGenre}</span>
              <span style="color: #808080; font-size: 0.75rem; display:flex; align-items:center; gap:4px;">
                <svg height="12" width="12" viewBox="0 0 24 24" fill="#808080"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                ${streams} streams
              </span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <button class="like-btn" data-song-id="${song.id}" style="background:none; border:none; cursor:pointer; padding:4px; outline:none; transition:transform 0.15s ease;">
              <svg class="heart-icon" height="20" width="20" viewBox="0 0 24 24" fill="${isLiked ? '#1DB954' : 'none'}" stroke="${isLiked ? '#1DB954' : '#b3b3b3'}" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <span class="like-count" style="color: #808080; font-size: 0.75rem; font-weight: bold;">${totalLikes}</span>
          </div>
        </div>

      </div>
    `
  }).join('')

  const filterPillsHtml = uniqueGenres.map((genre, idx) => `
    <button class="genre-pill ${idx === 0 ? 'active' : ''}" data-genre="${genre.toLowerCase()}" style="background: ${idx === 0 ? '#1DB954' : '#282828'}; color: ${idx === 0 ? 'white' : '#b3b3b3'}; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease;">
      ${genre}
    </button>
  `).join('')

  return `
    <div style="padding: 30px; max-width: 1200px; margin: 0 auto; padding-bottom: 120px;">
      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 35px;">
        <div style="position: relative; max-width: 450px; width: 100%;">
          <input type="text" id="search-tracks" placeholder="Search by songs or artists..." style="width: 100%; padding: 12px 16px; padding-left: 42px; background: #282828; border: 1px solid transparent; color: white; border-radius: 24px; font-size: 0.95rem; outline: none;" />
          <svg height="16" width="16" viewBox="0 0 24 24" fill="#b3b3b3" style="position: absolute; top: 14px; left: 16px;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">${filterPillsHtml}</div>
      </div>

      <h1 style="color: white; margin-bottom: 24px; font-size: 1.6rem;">Discover New Vibrations</h1>
      
      <style>
        .songs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; }
        .song-card:hover { background: #282828 !important; }
        .song-card:hover .play-overlay { opacity: 1 !important; transform: translateY(0) !important; }
        #search-tracks:focus { border-color: #1DB954 !important; }
        .genre-pill:hover { transform: scale(1.04); }
        .like-btn:hover { transform: scale(1.15); }
      </style>

      <div class="songs-grid" id="catalog-grid">${cardsHtml}</div>
    </div>
  `
}

renderHome.attachEvents = function() {
  const cards = document.querySelectorAll('.song-card')
  const searchInput = document.getElementById('search-tracks')
  const genrePills = document.querySelectorAll('.genre-pill')
  const likeButtons = document.querySelectorAll('.like-btn')
  
  let currentFilterGenre = 'all'
  let currentSearchQuery = ''

  function filterCatalogUI() {
    cards.forEach(card => {
      const matchesGenre = (currentFilterGenre === 'all' || card.getAttribute('data-genre') === currentFilterGenre)
      const matchesSearch = (card.getAttribute('data-title').includes(currentSearchQuery) || card.getAttribute('data-artist').includes(currentSearchQuery))
      card.style.display = (matchesGenre && matchesSearch) ? 'flex' : 'none'
    })
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim()
      filterCatalogUI()
    })
  }

  genrePills.forEach(pill => {
    pill.addEventListener('click', () => {
      genrePills.forEach(p => { p.style.background = '#282828'; p.style.color = '#b3b3b3' })
      pill.style.background = '#1DB954'; pill.style.color = 'white'
      currentFilterGenre = pill.getAttribute('data-genre')
      filterCatalogUI()
    })
  })

  // INTERACTIVE TOGGLE LIKE ACTIONS WITH IMMEDIATE COUNTER MANIPULATION
  likeButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation() 
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return alert("You must be logged in to like tracks!")

      const songId = btn.getAttribute('data-song-id')
      const heartSvg = btn.querySelector('.heart-icon')
      const countLabel = btn.nextElementSibling // Grabs the count label directly below the heart button
      let currentNumber = parseInt(countLabel.innerText) || 0

      const currentlyLiked = heartSvg.getAttribute('fill') !== 'none'

      if (currentlyLiked) {
        const { error } = await supabase.from('likes').delete().eq('user_id', session.user.id).eq('song_id', songId)
        if (!error) {
          heartSvg.setAttribute('fill', 'none')
          heartSvg.setAttribute('stroke', '#b3b3b3')
          countLabel.innerText = Math.max(0, currentNumber - 1)
        }
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: session.user.id, song_id: songId })
        if (!error) {
          heartSvg.setAttribute('fill', '#1DB954')
          heartSvg.setAttribute('stroke', '#1DB954')
          countLabel.innerText = currentNumber + 1
        }
      }
    })
  })

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const songId = card.getAttribute('data-id')
      const audioUrl = card.getAttribute('data-audio')
      const title = card.getAttribute('data-display-title')
      const artist = card.getAttribute('data-display-artist')
      const artUrl = card.getAttribute('data-art')

      window.dispatchEvent(new CustomEvent('nectar-play', {
        detail: { songId, audioUrl, title, artist, artUrl }
      }))
    })
  })
}