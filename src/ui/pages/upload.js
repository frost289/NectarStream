import { supabase } from '../../supabase.js'

export async function renderUpload(currentUser) {
  if (!currentUser) {
    return `
      <div style="padding: 60px 20px; text-align: center; color: #b3b3b3;">
        <h2 style="color: white; margin-bottom: 12px;">Artist Studio</h2>
        <p>You must be logged in to access the creator distribution portal.</p>
      </div>
    `
  }

  return `
    <div style="padding: 40px 20px; max-width: 1100px; margin: 0 auto;">
      <div style="border-bottom: 1px solid #282828; padding-bottom: 20px; margin-bottom: 35px;">
        <h1 style="color: white; font-size: 2rem; margin-bottom: 6px;">Artist Studio Dashboard</h1>
        <p style="color: #b3b3b3; margin: 0;">Publish and manage your sounds and written expressions globally.</p>
      </div>

      <div class="studio-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
        
        <section style="background: #181818; border: 1px solid #282828; border-radius: 8px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
          <h2 style="color: white; font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg height="18" width="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            Publish New Single
          </h2>
          <hr style="border: none; border-top: 1px solid #282828;" />
          
          <form id="studio-audio-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Track Title</label>
              <input type="text" id="track-title" required style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Genre Tag</label>
              <input type="text" id="track-genre" placeholder="e.g. Lofi, Afro, Hip-Hop" style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Audio File (.mp3)</label>
              <input type="file" id="track-audio-file" accept="audio/mp3" required style="color: #b3b3b3; font-size: 0.9rem;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Cover Art Image</label>
              <input type="file" id="track-art-file" accept="image/*" required style="color: #b3b3b3; font-size: 0.9rem;" />
            </div>
            <button type="submit" id="audio-submit-btn" style="background: #1DB954; color: white; border: none; padding: 12px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;">
              Publish Track
            </button>
          </form>
        </section>

        <section style="background: #181818; border: 1px solid #282828; border-radius: 8px; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
          <h2 style="color: white; font-size: 1.3rem; margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg height="18" width="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M14 2H6c-1.1 0-1.99.89-1.99 1.99L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            Publish Written Word
          </h2>
          <hr style="border: none; border-top: 1px solid #282828;" />

          <form id="studio-literature-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Composition Title</label>
              <input type="text" id="lit-title" required placeholder="Name your poem, lyrics, or essay" style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px;" />
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Literature Style Classification</label>
              <select id="lit-type" style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px; cursor: pointer;">
                <option value="Lyrics">Lyrics</option>
                <option value="Poetry">Poetry</option>
                <option value="Liner Notes">Liner Notes</option>
                <option value="Essay">Essay</option>
              </select>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; color: #b3b3b3;">Body Text Content</label>
              <textarea id="lit-content" required placeholder="Type or paste your verses here..." style="padding: 12px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px; min-height: 140px; resize: vertical; line-height: 1.5; font-family: inherit;"></textarea>
            </div>

            <button type="submit" id="lit-submit-btn" style="background: #1DB954; color: white; border: none; padding: 12px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;">
              Publish to Literature Feed
            </button>
          </form>
        </section>

      </div>
    </div>
  `
}

export function attachStudioEvents(currentUser) {
  if (!currentUser) return

  // --- AUDIO FORM LOGIC HANDLER ---
  const audioForm = document.getElementById('studio-audio-form')
  if (audioForm) {
    audioForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const submitBtn = document.getElementById('audio-submit-btn')
      submitBtn.disabled = true
      submitBtn.innerText = 'Uploading files...'

      try {
        const title = document.getElementById('track-title').value
        const genre = document.getElementById('track-genre').value
        const audioFile = document.getElementById('track-audio-file').files[0]
        const artFile = document.getElementById('track-art-file').files[0]

        if (!audioFile || !artFile) throw new Error("Please select both audio and artwork files.")

        // Upload files uniquely to your storage buckets
        const fileExtAudio = audioFile.name.split('.').pop()
        const pathAudio = `${currentUser.id}/${Date.now()}.${fileExtAudio}`
        let uploadAudio = await supabase.storage.from('songs').upload(pathAudio, audioFile)
        if (uploadAudio.error) throw uploadAudio.error

        const fileExtArt = artFile.name.split('.').pop()
        const pathArt = `${currentUser.id}/${Date.now()}.${fileExtArt}`
        let uploadArt = await supabase.storage.from('artwork').upload(pathArt, artFile)
        if (uploadArt.error) throw uploadArt.error

        // Resolve global URLs
        const audioUrl = supabase.storage.from('songs').getPublicUrl(pathAudio).data.publicUrl
        const coverArtUrl = supabase.storage.from('artwork').getPublicUrl(pathArt).data.publicUrl

        // Insert index row records into your songs catalog table
        const { error } = await supabase.from('songs').insert({
          artist_id: currentUser.id,
          title,
          genre,
          audio_url: audioUrl,
          cover_art_url: coverArtUrl
        })

        if (error) throw error

        alert('Track published globally with success!')
        audioForm.reset()
      } catch (err) {
        alert('Failed to publish track: ' + err.message)
      } finally {
        submitBtn.disabled = false
        submitBtn.innerText = 'Publish Track'
      }
    })
  }

  // --- NEW LITERATURE FORM LOGIC HANDLER ---
  const litForm = document.getElementById('studio-literature-form')
  if (litForm) {
    litForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const submitBtn = document.getElementById('lit-submit-btn')
      
      submitBtn.disabled = true
      submitBtn.innerText = 'Publishing words...'

      try {
        const title = document.getElementById('lit-title').value
        const type = document.getElementById('lit-type').value
        const content = document.getElementById('lit-content').value

        // Direct table insertion targeting the verified author_id field
        const { error } = await supabase.from('literature').insert({
          author_id: currentUser.id,
          title,
          type,
          content
        })

        if (error) throw error

        alert('Composition successfully broadcast to the Literature Feed!')
        litForm.reset()
        
        // Push user automatically to view their new contribution live
        window.location.hash = '#/literature'
      } catch (err) {
        alert('Failed to drop literature entry: ' + err.message)
      } finally {
        submitBtn.disabled = false
        submitBtn.innerText = 'Publish to Literature Feed'
      }
    })
  }
}

// Map attachEvents standard proxy definitions back cleanly to handle main router calls
renderUpload.attachEvents = attachStudioEvents;