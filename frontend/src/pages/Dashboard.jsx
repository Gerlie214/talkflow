import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Mic, Flame, Clock3, ListTodo, TrendingUp } from "lucide-react";
import { getRecent, getSettings } from "@/lib/storage";
import { listTopics, getStats } from "@/lib/api";
import { formatDuration } from "@/lib/format";

export default function Dashboard() {
  const nav = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const settings = getSettings();

  useEffect(() => {
    (async () => {
      try {
        const [topics, s] = await Promise.all([listTopics(), getStats()]);
        setRecommended(topics.slice(0, 4));
        setStats(s);
      } catch (e) {
        console.error(e);
      }
      setRecent(getRecent());
    })();
  }, []);

  const continueItem = recent[0];

  return (
    <div className="space-y-8 tf-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.24em] uppercase text-white/40 font-body">Speaking Studio</div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-medium mt-2 leading-[1.05]">
            Welcome back.<br />
            <span className="text-white/40">Ready when you are.</span>
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs tracking-[0.24em] uppercase text-white/40">Session</div>
          <div className="font-heading text-2xl text-white/90 mt-1">{settings.defaultSessionMinutes} min default</div>
        </div>
      </div>

      {/* Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Continue / Quick start hero */}
        <div className="md:col-span-3 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#141416] to-[#0B0B0D] p-8 min-h-[280px] flex flex-col justify-between">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1633933757597-2d09c360c2ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBzcGVha2luZyUyMG1pY3JvcGhvbmUlMjByZWNvcmRpbmclMjBzdHVkaW8lMjB3YXJtJTIwbGlnaHRpbmd8ZW58MHx8fHwxNzg2MTIzNDI5fDA&ixlib=rb-4.1.0&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              maskImage: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0.1))",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0.1))",
            }}
          />
          <div className="relative">
            <div className="text-xs tracking-[0.24em] uppercase text-[#FFB067] font-body">
              {continueItem ? "Continue Practice" : "Quick Start"}
            </div>
            <div className="font-heading text-3xl md:text-4xl font-medium mt-3 max-w-lg">
              {continueItem ? continueItem.title : "Warm up with a five-minute topic"}
            </div>
            <p className="mt-3 text-white/60 max-w-md font-body">
              {continueItem
                ? "Pick up right where you left off. One line at a time."
                : "Choose any topic to open the karaoke practice screen. Speak at your own pace."}
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3 mt-6">
            {continueItem ? (
              <button
                data-testid="continue-practice-btn"
                onClick={() =>
                  nav("/practice", {
                    state: {
                      mode: continueItem.mode || "guided",
                      topicId: continueItem.topicId,
                      customScriptId: continueItem.customScriptId,
                      title: continueItem.title,
                    },
                  })
                }
                className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
              >
                Resume <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/library"
                data-testid="quick-start-library-btn"
                className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
              >
                Browse Library <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/free"
              data-testid="free-speaking-btn"
              className="tf-focus inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:border-white/30 hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Free Speaking
            </Link>
            <Link
              to="/custom"
              data-testid="custom-script-btn"
              className="tf-focus inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:border-white/30 hover:text-white transition-colors"
            >
              <Mic className="h-4 w-4" /> Custom Script
            </Link>
          </div>
        </div>

        {/* Streak / stats */}
        <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="text-xs tracking-[0.24em] uppercase text-white/40">Streak</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-medium text-white" data-testid="stat-streak">{stats?.streak ?? 0}</span>
              <span className="text-white/40 text-sm">days</span>
            </div>
            <Flame className="mt-3 h-5 w-5 text-[#FFB067]" />
          </div>
          <div className="space-y-3 pt-4 border-t border-white/5">
            <StatRow icon={Clock3} label="Total time" value={formatDuration(stats?.total_seconds || 0)} testid="stat-total-time" />
            <StatRow icon={ListTodo} label="Sessions" value={stats?.total_sessions ?? 0} testid="stat-sessions" />
            <StatRow icon={TrendingUp} label="Topics done" value={stats?.topics_completed ?? 0} testid="stat-topics" />
          </div>
        </div>
      </div>

      {/* Recommended topics */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs tracking-[0.24em] uppercase text-white/40">Recommended</div>
            <h2 className="font-heading text-2xl md:text-3xl font-medium mt-1">Try these next</h2>
          </div>
          <Link to="/library" data-testid="see-all-topics-link" className="text-sm text-white/60 hover:text-white transition-colors">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map((t) => (
            <Link
              key={t.id}
              to={`/topic/${t.id}`}
              data-testid={`recommended-topic-${t.id}`}
              className="group rounded-xl border border-white/10 bg-[#121214] p-5 hover:border-white/25 hover:bg-[#18181B] transition-colors"
            >
              <div className="text-[10px] tracking-[0.24em] uppercase text-[#FFB067]/80">{t.category}</div>
              <div className="font-heading text-lg font-medium mt-2 leading-tight">{t.title}</div>
              <p className="text-sm text-white/50 mt-2 line-clamp-2 font-body">{t.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                <span className="capitalize">{t.difficulty}</span>
                <span>{t.duration_min} min · {t.sentences.length} lines</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section>
          <div className="text-xs tracking-[0.24em] uppercase text-white/40 mb-3">Recent</div>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 6).map((r, i) => (
              <Link
                key={i}
                to={r.topicId ? `/topic/${r.topicId}` : r.customScriptId ? `/custom` : "/library"}
                data-testid={`recent-item-${i}`}
                className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-sm text-white/70 hover:border-white/25 hover:text-white transition-colors"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const StatRow = ({ icon: Icon, label, value, testid }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-xs text-white/50">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="font-heading text-sm text-white/90" data-testid={testid}>{value}</div>
  </div>
);
