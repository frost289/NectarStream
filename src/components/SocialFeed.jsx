import { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus, Upload } from "lucide-react";
import { getRecentActivity } from "../lib/activity";

const ICONS = { like: Heart, comment: MessageCircle, follow: UserPlus, upload: Upload };
const VERB = { like: "liked", comment: "commented on", follow: "followed", upload: "uploaded" };

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

export default function SocialFeed() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentActivity(15).then((data) => {
      setActivity(data);
      setLoading(false);
    });
  }, []);

  if (loading || activity.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-3">Social Pulse</h2>
      <div className="flex flex-col gap-3">
        {activity.map((item) => {
          const Icon = ICONS[item.type] || Heart;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.actorPhoto} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
              <p className="flex-1 min-w-0 text-sm text-slate-300 truncate">
                <span className="font-medium text-white">{item.actorName}</span>{" "}
                {VERB[item.type]}{" "}
                <span className="text-orange-400">{item.targetTitle}</span>
              </p>
              <Icon size={16} className="text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo(item.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}