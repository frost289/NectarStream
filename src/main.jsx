import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TracksProvider } from './context/TracksContext.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TracksProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </TracksProvider>
    </AuthProvider>
  </StrictMode>,
)