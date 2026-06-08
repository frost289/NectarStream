import { supabase } from '../lib/supabaseClient.js';

/**
 * Main rendering endpoint for the NectarStream Authentication interface
 */
export async function renderLogin() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // 1. Inject semantic login/signup structural markup layouts natively
    container.innerHTML = `
        <div class="auth-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
            <div class="auth-container" style="background: #111; padding: 40px; border-radius: 8px; width: 100%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <h2 id="auth-title" style="margin-bottom: 24px; font-size: 24px; color: #fff;">Login to NectarStream</h2>
                
                <form id="auth-form" style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                        <label for="auth-email" style="color: #aaa; font-size: 14px;">Email Address</label>
                        <input type="email" id="auth-email" required placeholder="yourname@example.com" 
                               style="padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                        <label for="auth-password" style="color: #aaa; font-size: 14px;">Password</label>
                        <input type="password" id="auth-password" required placeholder="••••••" 
                               style="padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 4px; font-size: 14px;">
                    </div>
                    
                    <button type="submit" id="auth-submit-btn" class="btn-primary" 
                            style="padding: 14px; background: #f50; color: #fff; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 16px; transition: background 0.2s; margin-top: 10px;">
                        Sign In
                    </button>
                </form>
                
                <p class="auth-toggle-text" style="margin-top: 24px; text-align: center; color: #aaa; font-size: 14px;">
                    Don't have an account? <span id="auth-toggle-link" style="color: #f50; cursor: pointer; font-weight: bold; text-decoration: none;">Register here</span>
                </p>
            </div>
        </div>
    `;

    // 2. Element tracking handles
    let isLoginMode = true;
    const form = document.getElementById('auth-form');
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-link');

    // 3. Setup client-side mode toggle interface engine
    toggleLink.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            title.innerText = "Login to NectarStream";
            submitBtn.innerText = "Sign In";
            toggleLink.innerText = "Register here";
            toggleLink.previousSibling.textContent = "Don't have an account? ";
        } else {
            title.innerText = "Create Your Account";
            submitBtn.innerText = "Register";
            toggleLink.innerText = "Login here";
            toggleLink.previousSibling.textContent = "Already have an account? ";
        }
    });

    // 4. Form Processing Execution Core
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        // Freeze control inputs during active database asynchronous threads
        submitBtn.disabled = true;
        submitBtn.innerText = isLoginMode ? "Signing In..." : "Registering...";

        try {
            if (isLoginMode) {
                // ==========================================================
                // USER SIGN-IN ENGINE RUNTIME
                // ==========================================================
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;
                
                console.log(`Auth System: Session verified completely for UID: [${data.user.id}]`);
                window.loadPage('home');

            } else {
                // ==========================================================
                // NEW USER SIGN-UP ENGINE RUNTIME
                // CRITICAL FIX: Direct insert code removed. The database trigger 
                // generates profile columns automatically inside public.profiles!
                // ==========================================================
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password
                });

                if (error) throw error;

                // Handle email link verification check cases elegantly
                if (data.user && !data.session) {
                    alert("Registration successful! Please check your email inbox to verify your account credentials.");
                    isLoginMode = true;
                    title.innerText = "Login to NectarStream";
                    submitBtn.innerText = "Sign In";
                    toggleLink.innerText = "Register here";
                    toggleLink.previousSibling.textContent = "Don't have an account? ";
                    form.reset();
                } else {
                    alert("Account registered successfully!");
                    window.loadPage('home');
                }
            }
        } catch (err) {
            console.error("Authentication Exception Error Loop:", err.message);
            alert("Authentication Failed: " + err.message);
        } finally {
            // Restore submission elements states upon resolution paths completion
            submitBtn.disabled = false;
            submitBtn.innerText = isLoginMode ? "Sign In" : "Register";
        }
    });
}