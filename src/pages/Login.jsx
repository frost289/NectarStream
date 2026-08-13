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
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6 bg-night relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-wave-cyan/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-wave-orange/20 rounded-full blur-3xl" />

      <Logo className="h-32 relative z-10" />
      <p className="text-muted text-sm relative z-10">Stream. Upload. Connect.</p>

      <button
        onClick={handleGoogleLogin}
        className="relative z-10 bg-ink text-night px-8 py-3.5 rounded-full font-semibold shadow-lg active:scale-95 transition"
      >
        Continue with Google
      </button>
    </div>
  );
}