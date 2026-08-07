import { useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage";
import { toast } from "sonner";

export default function Settings() {
  const [s, setS] = useState(() => getSettings());

  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
    toast.success("Saved");
  };

  return (
    <div className="space-y-8 tf-slide-up max-w-2xl">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Settings</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          Tune your studio.
        </h1>
      </div>

      <Card title="Practice">
        <Row label="Auto-advance to next sentence" hint="Automatically move forward while playing.">
          <Toggle
            testid="setting-auto-advance"
            checked={s.autoAdvance}
            onChange={(v) => update({ autoAdvance: v })}
          />
        </Row>
        <Row label="Auto-advance interval" hint="Seconds per sentence when auto-advance is on.">
          <select
            data-testid="setting-auto-advance-seconds"
            value={s.autoAdvanceSeconds}
            onChange={(e) => update({ autoAdvanceSeconds: Number(e.target.value) })}
            className="tf-focus rounded-lg border border-white/15 bg-[#121214] px-3 py-2 text-sm"
          >
            {[3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>{n}s</option>
            ))}
          </select>
        </Row>
        <Row label="Default free-speaking length">
          <select
            data-testid="setting-default-minutes"
            value={s.defaultSessionMinutes}
            onChange={(e) => update({ defaultSessionMinutes: Number(e.target.value) })}
            className="tf-focus rounded-lg border border-white/15 bg-[#121214] px-3 py-2 text-sm"
          >
            {[1, 2, 3, 5, 8, 10].map((n) => (
              <option key={n} value={n}>{n} min</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card title="About">
        <p className="text-sm text-white/60 font-body leading-relaxed">
          TalkFlow is a speaking practice studio. Your data is stored locally on your device.
          No account needed. Just press play, speak, and grow.
        </p>
      </Card>
    </div>
  );
}

const Card = ({ title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6">
    <div className="text-[10px] tracking-[0.24em] uppercase text-white/40 mb-4">{title}</div>
    <div className="space-y-5">{children}</div>
  </section>
);

const Row = ({ label, hint, children }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div className="min-w-0">
      <div className="font-heading text-base">{label}</div>
      {hint && <div className="text-xs text-white/40 mt-0.5">{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, testid }) => (
  <button
    onClick={() => onChange(!checked)}
    data-testid={testid}
    role="switch"
    aria-checked={checked}
    className={`tf-focus relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? "bg-[#FFB067]" : "bg-white/10"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);
