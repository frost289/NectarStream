import { supabase } from '../../supabase.js'

export function initAuthModal() {
  if (document.getElementById('global-auth-modal')) return

  const modalContainer = document.createElement('div')
  modalContainer.id = 'global-auth-modal'
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease, visibility 0.25s ease;
  `

  modalContainer.innerHTML = `
    <div style="background: #181818; width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid #282828; padding: 30px; position: relative; box-shadow: 0 12px 40px rgba(0,0,0,0.5);">
      <button id="modal-close-btn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: #b3b3b3; font-size: 1.2rem; cursor: pointer;">&times;</button>
      
      <div style="display: flex; gap: 20px; margin-bottom: 24px; border-bottom: 1px solid #282828; padding-bottom: 10px;">
        <h3 id="tab-login" style="color: white; cursor: pointer; border-bottom: 2px solid #1DB954; padding-bottom: 8px; margin: 0;">Log In</h3>
        <h3 id="tab-signup" style="color: #b3b3b3; cursor: pointer; padding-bottom: 8px; margin: 0;">Sign Up</h3>
      </div>

      <form id="modal-auth-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 0.85rem; color: #b3b3b3;">Email Address</label>
          <input type="email" id="auth-email" required style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px; font-size: 0.95rem;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 0.85rem; color: #b3b3b3;">Password</label>
          <input type="password" id="auth-password" required minlength="6" style="padding: 10px; background: #282828; border: 1px solid #404040; color: white; border-radius: 4px; font-size: 0.95rem;" />
        </div>

        <button type="submit" id="auth-submit-btn" style="background: #1DB954; color: white; border: none; padding: 12px; font-weight: bold; border-radius: 4px; cursor: pointer; margin-top: 10px; font-size: 1rem;">
          Log In
        </button>
      </form>
    </div>
  `

  document.body.appendChild(modalContainer)

  // Internal component state
  let isLoginMode = true

  const tabLogin = document.getElementById('tab-login')
  const tabSignup = document.getElementById('tab-signup')
  const submitBtn = document.getElementById('auth-submit-btn')
  const form = document.getElementById('modal-auth-form')
  const closeBtn = document.getElementById('modal-close-btn')

  // Switch to Login Tab
  tabLogin.addEventListener('click', () => {
    isLoginMode = true
    tabLogin.style.color = 'white'
    tabLogin.style.borderBottom = '2px solid #1DB954'
    tabSignup.style.color = '#b3b3b3'
    tabSignup.style.borderBottom = 'none'
    submitBtn.innerText = 'Log In'
  })

  // Switch to Signup Tab
  tabSignup.addEventListener('click', () => {
    isLoginMode = false
    tabSignup.style.color = 'white'
    tabSignup.style.borderBottom = '2px solid #1DB954'
    tabLogin.style.color = '#b3b3b3'
    tabLogin.style.borderBottom = 'none'
    submitBtn.innerText = 'Create Account'
  })

  // Handle Close Interactions
  closeBtn.addEventListener('click', hideAuthModal)
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) hideAuthModal()
  })

  // Handle Form Submission Pipeline
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('auth-email').value
    const password = document.getElementById('auth-password').value

    submitBtn.disabled = true
    submitBtn.innerText = 'Processing...'

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        alert('Welcome back!')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Account created! Check your email for verification if required.')
      }
      hideAuthModal()
    } catch (err) {
      alert('Authentication error: ' + err.message)
    } finally {
      submitBtn.disabled = false
      submitBtn.innerText = isLoginMode ? 'Log In' : 'Create Account'
    }
  })
}

// Global window event listeners or layout switches can trigger these functions
export function showAuthModal() {
  const modal = document.getElementById('global-auth-modal')
  if (modal) {
    modal.style.visibility = 'visible'
    modal.style.opacity = '1'
  }
}

export function hideAuthModal() {
  const modal = document.getElementById('global-auth-modal')
  if (modal) {
    modal.style.opacity = '0'
    modal.style.visibility = 'hidden'
  }
}