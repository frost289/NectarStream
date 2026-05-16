import { supabase } from './supabase.js'
import { renderHome } from './ui/pages/home.js'
import { renderUpload } from './ui/pages/upload.js'
import { renderLiterature } from './ui/pages/literature.js'
import { initAudioPlayer } from './ui/components/audioPlayer.js'
import { initAuthModal, showAuthModal } from './ui/components/authModal.js'

// Global Application State Tracking
let currentUser = null

/**
 * CLIENT-SIDE ROUTER ENGINE
 * Swaps view containers dynamically based on the current window location hash
 */
async function router() {
  const appContainer = document.getElementById('app')
  if (!appContainer) return

  // Read current hash location or default to home/streams feed automatically
  const rawPath = window.location.hash || '#/'
  const path = rawPath.replace('#', '')

  // Clear previous main container markup to handle dynamic rendering transitions cleanly
  appContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: #b3b3b3;">Loading view...</div>`

  switch (path) {
    case '/':
    case '/streams':
      appContainer.innerHTML = await renderHome()
      if (typeof renderHome.attachEvents === 'function') {
        renderHome.attachEvents()
      }
      break

    case '/upload':
    case '/artist-studio':
      appContainer.innerHTML = await renderUpload(currentUser)
      if (typeof renderUpload.attachEvents === 'function') {
        renderUpload.attachEvents(currentUser)
      }
      break

    case '/literature':
      appContainer.innerHTML = await renderLiterature()
      break

    default:
      appContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: white;">
          <h2>404 - Page Not Found</h2>
          <a href="#/" style="color: #1DB954; text-decoration: none; margin-top: 15px; display: inline-block;">Return to Streams Feed</a>
        </div>
      `
  }
}

/**
 * GLOBAL AUTHENTICATION BANNER SYNC
 * Updates the navbar links and profile controls depending on active session state
 */
function updateNavbarUI(user) {
  const authNavContainer = document.getElementById('auth-nav-container')
  if (!authNavContainer) return

  if (user) {
    authNavContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="color: #1DB954; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
          <svg height="14" width="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"/></svg>
          ${user.email}
        </span>
        <button id="nav-logout-btn" style="background: #e91429; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">
          Logout
        </button>
      </div>
    `

    // Wire up log out functionality
    document.getElementById('nav-logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.hash = '#/'
    })
  } else {
    authNavContainer.innerHTML = `
      <button id="nav-login-btn" style="background: #1DB954; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
        Log In / Sign Up
      </button>
    `

    // Open the sliding modal directly on user click
    document.getElementById('nav-login-btn').addEventListener('click', showAuthModal)
  }
}

/**
 * APPLICATION ENTRY INITIALIZATION LAYER
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Kickstart global component micro-interfaces
  initAudioPlayer()
  initAuthModal()

  // 2. Sniff existing auth tokens to map active user layout components
  const { data: { session } } = await supabase.auth.getSession()
  currentUser = session?.user || null
  updateNavbarUI(currentUser)

  // 3. Keep real-time track of auth state adjustments globally
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null
    updateNavbarUI(currentUser)
    router() // Recalculate view display state instantly
  })

  // 4. Attach hash listener links for custom layout routing tabs
  window.addEventListener('hashchange', router)

  // 5. Fire initial router execution pass
  router()
})