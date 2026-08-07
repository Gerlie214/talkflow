import { useEffect, useState } from "react";
import { getStats } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { Flame, Clock3, ListTodo, TrendingUp } from "lucide-react";

export default function ProgressPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setStats(await getStats());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const maxSec = Math.max(1, ...(stats?.weekly?.map((w) => w.seconds) || [0]));

  return (
    <div className="space-y-8 tf-slide-up">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Progress</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          Your journey.<br /><span className="text-white/40">Line by line.</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BigStat icon={Flame} label="Streak" value={stats?.streak ?? 0} suffix="days" testid="progress-streak" />
        <BigStat icon={Clock3} label="Total time" value={formatDuration(stats?.total_seconds || 0)} testid="progress-total-time" />
        <BigStat icon={ListTodo} label="Sessions" value={stats?.total_sessions ?? 0} testid="progress-sessions" />
        <BigStat icon={TrendingUp} label="Topics" value={stats?.topics_completed ?? 0} testid="progress-topics" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.24em] uppercase text-white/40">Last 7 days</div>
            <div className="font-heading text-xl mt-1">Weekly rhythm</div>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40" data-testid="weekly-chart">
          {(stats?.weekly || []).map((w) => {
            const heightPct = (w.seconds / maxSec) * 100;
            const day = new Date(w.day).toLocaleDateString(undefined, { weekday: "short" });
            return (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#FFB067]/80 to-[#FFB067]/40 transition-[height] duration-500"
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                  title={`${formatDuration(w.seconds)}`}
                />
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">{day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const BigStat = ({ icon: Icon, label, value, suffix, testid }) => (
  <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
    <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white/40">
      <Icon className="h-3.5 w-3.5 text-[#FFB067]" />
      {label}
    </div>
    <div className="flex items-baseline gap-1.5 mt-3">
      <span className="font-heading text-4xl font-medium" data-testid={testid}>{value}</span>
      {suffix && <span className="text-white/40 text-xs">{suffix}</span>}
    </div>
  </div>
);
