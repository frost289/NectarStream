import { supabase } from '../lib/supabaseClient.js';

export async function renderLibrary() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <h1>Library / Bulletin Board</h1>
        <div id="lit-form">
            <textarea id="lit-input" placeholder="Share your literary work..."></textarea>
            <button id="submit-lit">Publish to Library</button>
        </div>
        <div id="lit-posts"></div>
    `;

    document.getElementById('submit-lit').onclick = async () => {
        const content = document.getElementById('lit-input').value;
        if (!content) return alert("Please write something!");

        // Insert with 0 default likes
        const { error } = await supabase.from('literature').insert([{ content, likes: 0 }]);
        if (error) return alert("Error saving: " + error.message);
        
        document.getElementById('lit-input').value = '';
        loadPosts(); 
    };

    loadPosts();
}

async function loadPosts() {
    const { data: posts } = await supabase.from('literature').select('*').order('created_at', { ascending: false });
    const postsDiv = document.getElementById('lit-posts');
    postsDiv.innerHTML = posts.map(post => `
        <div class="post">
            <p>${post.content}</p>
            <div class="post-footer">
                <small>Posted on ${new Date(post.created_at).toLocaleDateString()}</small>
                <button onclick="likePost(${post.id}, ${post.likes})" class="like-btn">❤️ ${post.likes || 0}</button>
            </div>
        </div>
    `).join('');
}

window.likePost = async (id, currentLikes) => {
    const { error } = await supabase
        .from('literature')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);
        
    if (!error) loadPosts(); // Refresh view
};