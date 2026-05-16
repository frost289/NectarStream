import { supabase } from '../../supabase.js'
import { signUpUser, logInUser, logOutUser } from '../../api/auth.js'

export function renderNavbar(user) {
  const container = document.getElementById('navbar-container')
  if (!container) return

  container.innerHTML = `
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: #111; color: white; border-bottom: 1px solid #222;">
      <div style="display: flex; gap: 20px; align-items: center;">
        <a href="/" data-link style="color: #1DB954; font-weight: bold; text-decoration: none; font-size: 1.2rem;">NectarStream</a>
        <a href="/" data-link style="color: #ccc; text-decoration: none;">Streams</a>
        <a href="/literature" data-link style="color: #ccc; text-decoration: none;">Literature</a>
        <a href="/upload" data-link style="color: #ccc; text-decoration: none;">Artist Studio</a>
      </div>

      <div id="auth-panel" style="display: flex; gap: 10px; align-items: center;">
        ${user ? `
          <span style="color: #1DB954; font-size: 0.9rem; margin-right: 10px;">👤 ${user.email}</span>
          <button id="nav-logout-btn" style="background: #e11d48; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Logout</button>
        ` : `
          <input type="email" id="auth-email" placeholder="Email" style="padding: 5px; border-radius: 4px; border: 1px solid #333; background: #222; color: white;" />
          <input type="password" id="auth-password" placeholder="Password" style="padding: 5px; border-radius: 4px; border: 1px solid #333; background: #222; color: white;" />
          <input type="text" id="auth-username" placeholder="Username" style="padding: 5px; border-radius: 4px; border: 1px solid #333; background: #222; color: white; width: 130px;" />
          <button id="nav-login-btn" style="background: #1DB954; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Login</button>
          <button id="nav-signup-btn" style="background: #333; color: white; border: 1px solid #555; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Sign Up</button>
        `}
      </div>
    </nav>
  `

  // Use a reliable execution timer context to prevent input box string reading lag
  setTimeout(() => {
    if (user) {
      document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
        try {
          await logOutUser()
          window.location.reload()
        } catch (err) {
          alert(err.message)
        }
      })
    } else {
      // Login Trigger logic
      document.getElementById('nav-login-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value.trim()
        const password = document.getElementById('auth-password').value
        if (!email || !password) return alert("Fill out email and password.")
        try {
          await logInUser(email, password)
          window.location.reload()
        } catch (err) {
          alert("Login error: " + err.message)
        }
      })

      // Signup Trigger logic
      document.getElementById('nav-signup-btn')?.addEventListener('click', async () => {
        const emailInput = document.getElementById('auth-email')
        const passwordInput = document.getElementById('auth-password')
        const usernameInput = document.getElementById('auth-username')

        const email = emailInput ? emailInput.value.trim() : ""
        const password = passwordInput ? passwordInput.value : ""
        const username = usernameInput ? usernameInput.value.trim() : ""

        console.log("Local variables compiled for payload ->", { email, password, username })

        if (!email || !password || !username) {
          return alert(`All fields required! Missing values: ${!email ? ' [Email] ' : ''}${!password ? ' [Password] ' : ''}${!username ? ' [Username] ' : ''}`)
        }
        
        try {
          await signUpUser(email, password, username, username)
          alert("Account registered successfully!")
          window.location.reload()
        } catch (err) {
          alert("Signup error: " + err.message)
        }
      })
    }
  }, 100)
}