import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getComments, addComment } from "../lib/comments";

function timeAgo(timestamp) {
  if (!timestamp?.toDate) return "";
  const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommentSheet({ track, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getComments(track.id).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [track.id]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    await addComment(track, user, text.trim());
    setText("");
    const data = await getComments(track.id);
    setComments(data);
    setPosting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 w-full max-h-[70vh] rounded-t-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">Comments</h3>
          <button onClick={onClose}><X size={22} className="text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {loading && <p className="text-slate-400 text-sm">Loading comments...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-slate-400 text-sm">No comments yet. Be the first to say something.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img src={c.userPhoto} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm">
                  <span className="font-medium text-white">{c.userName}</span>{" "}
                  <span className="text-slate-300">{c.text}</span>
                </p>
                <p className="text-xs text-slate-500">{timeAgo(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="flex items-center gap-2 p-4 border-t border-slate-800">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-800 rounded-full px-4 py-2 text-white text-sm"
            />
            <button onClick={handlePost} disabled={posting || !text.trim()} className="text-orange-400 disabled:opacity-40">
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}