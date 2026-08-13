import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">
      <Logo className="h-32" />
      <p className="text-muted text-sm">Stream. Upload. Connect.</p>
      <button onClick={handleGoogleLogin} className="bg-ink text-night px-8 py-3.5 rounded-full font-semibold shadow-lg active:scale-95 transition">
        Continue with Google
      </button>
    </div>
  );
}