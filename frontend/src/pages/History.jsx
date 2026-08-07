import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, PlayCircle } from "lucide-react";
import { listSessions, deleteSession } from "@/lib/api";
import { formatSeconds, relativeTime } from "@/lib/format";
import { getRecording } from "@/lib/storage";
import { toast } from "sonner";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await deleteSession(id);
      await load();
      toast.success("Session removed");
    } catch (e) {
      toast.error("Could not delete session");
    }
  };

  return (
    <div className="space-y-8 tf-slide-up">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Practice History</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          Your sessions.<br /><span className="text-white/40">All in one place.</span>
        </h1>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60">No sessions yet.</p>
          <Link
            to="/library"
            data-testid="history-empty-cta"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-5 py-2 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
          >
            Start your first practice
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const rec = s.audio_saved ? getRecording(s.id) : null;
            const isOpen = expanded === s.id;
            return (
              <div
                key={s.id}
                data-testid={`history-item-${s.id}`}
                className="rounded-xl border border-white/10 bg-[#121214] p-5 transition-colors hover:border-white/20"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#FFB067]/80">
                      {s.mode === "free" ? "Free Speaking" : s.mode === "custom" ? "Custom" : "Guided"}
                    </div>
                    <div className="font-heading text-lg mt-1 truncate">{s.topic_title}</div>
                    <div className="text-xs text-white/40 mt-1">{relativeTime(s.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatMini label="Duration" value={formatSeconds(s.duration_sec)} />
                    <StatMini label="Complete" value={`${s.completion_pct}%`} />
                    <StatMini label="Lines" value={`${s.sentences_completed}/${s.sentences_total}`} />
                    {rec && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : s.id)}
                        data-testid={`history-play-${s.id}`}
                        aria-label="Play recording"
                        className="tf-focus rounded-full p-2 text-[#FFB067] hover:bg-[#FFB067]/10 transition-colors"
                      >
                        <PlayCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => remove(s.id)}
                      data-testid={`history-delete-${s.id}`}
                      aria-label="Delete session"
                      className="tf-focus rounded-full p-2 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {isOpen && rec && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <audio controls src={rec} className="w-full" data-testid={`history-audio-${s.id}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const StatMini = ({ label, value }) => (
  <div className="hidden sm:block">
    <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</div>
    <div className="font-heading text-sm mt-0.5">{value}</div>
  </div>
);
