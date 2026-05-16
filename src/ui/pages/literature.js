import { supabase } from '../../supabase.js'

export async function renderLiterature() {
  // Query literature entries alongside author usernames
  const { data: posts, error } = await supabase
    .from('literature')
    .select(`
      id,
      title,
      type,
      content,
      created_at,
      profiles ( username )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Schema fault reading literature table:", error)
    return `
      <div style="padding: 40px; text-align: center; color: #ff5e5e;">
        <h3>Failed to load literature feed</h3>
        <p>${error.message}</p>
      </div>
    `
  }

  if (!posts || posts.length === 0) {
    return `
      <div style="padding: 60px; text-align: center; color: #b3b3b3; max-width: 600px; margin: 0 auto;">
        <h2 style="color: white; margin-bottom: 12px;">The Written Word</h2>
        <p>No lyrics, poetry, or liner notes have been published yet. Check back soon as artists begin building out their catalogs!</p>
      </div>
    `
  }

  // Map entries into clean text cards optimized for reading
  const entriesHtml = posts.map(post => {
    const authorName = post.profiles?.username || "Anonymous Writer"
    // Convert newlines in content to HTML breaks safely
    const formattedContent = post.content.replace(/\n/g, '<br>')

    return `
      <article class="lit-card" style="background: #181818; padding: 24px; border-radius: 8px; border: 1px solid #282828; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="color: white; margin: 0 0 4px 0; font-size: 1.4rem;">${post.title}</h2>
            <p style="color: #b3b3b3; margin: 0; font-size: 0.85rem;">Written by <span style="color: #1DB954;">${authorName}</span></p>
          </div>
          <span style="background: #282828; color: #1DB954; font-size: 0.75rem; font-weight: bold; padding: 4px 10px; border-radius: 12px; border: 1px solid #404040;">
            ${post.type}
          </span>
        </div>
        
        <hr style="border: none; border-top: 1px solid #282828; margin: 4px 0;" />
        
        <div class="lit-content" style="color: #e5e5e5; font-size: 1rem; line-height: 1.6; font-style: ${post.type === 'Poetry' ? 'italic' : 'normal'}; white-space: pre-line;">
          ${formattedContent}
        </div>
      </article>
    `
  }).join('')

  return `
    <div style="padding: 40px 20px; max-width: 800px; margin: 0 auto;">
      <div style="margin-bottom: 32px;">
        <h1 style="color: white; font-size: 2rem; margin-bottom: 8px;">Literature & Lyrics Feed</h1>
        <p style="color: #b3b3b3; margin: 0;">Explore the concepts, poetry, and stories directly from the creators.</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 30px;">
        ${entriesHtml}
      </div>
    </div>
  `
}