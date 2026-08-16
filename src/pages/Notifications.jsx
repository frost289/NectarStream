import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Upload, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllRead } from "../lib/notifications";

const ICONS = { like: Heart, comment: MessageCircle, follow: UserPlus, upload: Upload, approved: CheckCircle2, rejected: XCircle };
const VERB = {
  like: "liked your track",
  comment: "commented on your track",
  follow: "followed you",
  upload: "uploaded a new track",
  approved: "approved your track",
  rejected: "didn't approve your track",
};

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

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid).then((data) => {
      setNotifications(data);
      setLoading(false);
      markAllRead(user.uid, data).catch(() => {});
    });
  }, [user]);

  return (
    <div className="p-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24} className="text-ink" /></button>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Notifications</h1>
      </div>

      {loading && <p className="text-muted">Loading...</p>}
      {!loading && notifications.length === 0 && <p className="text-muted">Nothing here yet.</p>}

      <div className="flex flex-col gap-1">
        {notifications.map((n) => {
          const Icon = ICONS[n.type] || Heart;
          return (
            <div key={n.id} onClick={() => navigate(`/artist/${n.actorId}`)} className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer ${n.read ? "bg-panel" : "bg-panel-2"}`}>
              <img src={n.actorPhoto} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{n.actorName}</span> <span className="text-muted">{VERB[n.type]}</span> <span className="text-wave-orange">{n.targetTitle}</span>
                </p>
                <p className="text-xs text-muted">{timeAgo(n.createdAt)}</p>
              </div>
              <Icon size={18} className="text-muted flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}