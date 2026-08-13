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
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-slate-950">
      <Logo className="h-32" />
      <button
        onClick={handleGoogleLogin}
        className="bg-white text-black px-6 py-3 rounded-full font-medium"
      >
        Continue with Google
      </button>
    </div>
  );
}