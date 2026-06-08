import { supabase } from '../lib/supabaseClient.js';

let isSignUp = false;

export async function renderLogin() {
    const container = document.getElementById('app-container');
    
    container.innerHTML = `
        <div class="auth-container" style="max-width: 400px; margin-top: 40px;">
            <h1 id="auth-title">${isSignUp ? 'Create Artist Account' : 'Login'}</h1>
            <form id="auth-form" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                <div>
                    <label style="display:block; margin-bottom: 5px; color: #b3b3b3;">Email Address</label>
                    <input type="email" id="email" placeholder="artist@nectarstream.com" required>
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; color: #b3b3b3;">Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button type="submit" id="action-btn" style="margin-top: 10px;">
                    ${isSignUp ? 'Sign Up as Artist' : 'Sign In'}
                </button>
            </form>
            <p style="margin-top: 20px; color: #b3b3b3; font-size: 14px;">
                ${isSignUp ? 'Already have an account?' : 'New artist looking to share music?'} 
                <span id="toggle-auth-mode" style="color: #FF6600; cursor: pointer; font-weight: bold; margin-left: 5px;">
                    ${isSignUp ? 'Login here' : 'Sign up here'}
                </span>
            </p>
        </div>
    `;

    document.getElementById('toggle-auth-mode').onclick = () => {
        isSignUp = !isSignUp;
        renderLogin();
    };

    document.getElementById('auth-form').onsubmit = async (e) => {
        e.preventDefault(); 

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const actionBtn = document.getElementById('action-btn');

        actionBtn.innerText = "Processing...";
        actionBtn.disabled = true;

        try {
            if (isSignUp) {
                // 1. Create user in Supabase Auth System
                const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;
                
                if (authData?.user) {
                    console.log("Auth user created. Injecting profile row manually for UID:", authData.user.id);
                    
                    // 2. MANUALLY insert the profile row directly from frontend JavaScript
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([{ id: authData.user.id, role: 'artist' }]);
                    
                    if (profileError) {
                        console.error("Manual profile creation failed:", profileError.message);
                        throw new Error("Auth passed, but profile setup failed: " + profileError.message);
                    }
                }
                alert("Artist profile registered successfully!");
            }

            // 3. Log in to establish a fresh local session
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;

            alert("Authentication successful!");
            
            if (window.loadPage) {
                await window.loadPage('home');
            } else {
                window.location.hash = '#home';
            }

        } catch (err) {
            console.error("Authentication Process Error:", err);
            alert(err.message);
            
            actionBtn.innerText = isSignUp ? 'Sign Up as Artist' : 'Sign In';
            actionBtn.disabled = false;
        }
    };
}