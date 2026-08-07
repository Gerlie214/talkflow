import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Library, History, LineChart, Settings as SettingsIcon, Mic } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/library", label: "Library", icon: Library, testid: "nav-library" },
  { to: "/history", label: "History", icon: History, testid: "nav-history" },
  { to: "/progress", label: "Progress", icon: LineChart, testid: "nav-progress" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
];

export default function Layout() {
  return (
    <div className="relative min-h-screen text-white">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-white/5 bg-[#0B0B0D] z-30">
        <Link to="/" className="flex items-center gap-2 px-6 py-6" data-testid="brand-link">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB067]/10 border border-[#FFB067]/30">
            <Mic className="h-4 w-4 text-[#FFB067]" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-heading text-lg font-medium leading-none">TalkFlow</div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/40 mt-1">Studio</div>
          </div>
        </Link>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={n.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body transition-colors ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              <n.icon className="h-4 w-4" strokeWidth={2} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 mx-3 mb-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">Session</div>
          <div className="font-heading text-sm mt-1 text-white/80">Practice daily to build fluency</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 tf-glass px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-link-mobile">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB067]/10 border border-[#FFB067]/30">
            <Mic className="h-3.5 w-3.5 text-[#FFB067]" />
          </div>
          <span className="font-heading text-base font-medium">TalkFlow</span>
        </Link>
        <Link to="/library" className="text-xs uppercase tracking-[0.2em] text-white/60" data-testid="mobile-library-link">
          Library
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 tf-glass border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`${n.testid}-mobile`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md ${
                  isActive ? "text-[#FFB067]" : "text-white/50"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              <span className="text-[10px]">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:pl-60 pb-24 lg:pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
