import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import NowPlaying from "./components/NowPlaying";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Studio from "./pages/Studio";
import ArtistProfile from "./pages/ArtistProfile";
import Notifications from "./pages/Notifications";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-night text-ink pb-32">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <MiniPlayer />
        <NowPlaying />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}