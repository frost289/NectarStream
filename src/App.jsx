import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import NowPlaying from "./components/NowPlaying";
import ProtectedRoute from "./components/ProtectedRoute";
import ArtistRoute from "./components/ArtistRoute";
import AdminRoute from "./components/AdminRoute";
import AmbientBackground from "./components/AmbientBackground";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Studio from "./pages/Studio";
import ArtistProfile from "./pages/ArtistProfile";
import Notifications from "./pages/Notifications";
import BecomeArtist from "./pages/BecomeArtist";
import PlaylistDetail from "./pages/PlaylistDetail";
import AdminDashboard from "./pages/AdminDashboard";
import TrackShare from "./pages/TrackShare";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-night text-ink pb-32 relative">
        <AmbientBackground />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/studio" element={<ArtistRoute><Studio /></ArtistRoute>} />
            <Route path="/become-artist" element={<ProtectedRoute><BecomeArtist /></ProtectedRoute>} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/track/:id" element={<TrackShare />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <MiniPlayer />
        <NowPlaying />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}