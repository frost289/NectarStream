import { NavLink } from "react-router-dom";
import { Home, Search, Library, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/library", label: "Library", Icon: Library },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-panel/95 backdrop-blur border-t border-line flex justify-around py-2 z-20">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 px-3 py-1 transition ${
              isActive ? "text-wave-orange" : "text-muted"
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}