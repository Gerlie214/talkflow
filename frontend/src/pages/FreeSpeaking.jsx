import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Shuffle } from "lucide-react";
import { getFreePrompts } from "@/lib/api";

const DURATIONS = [
  { label: "1 min", sec: 60 },
  { label: "2 min", sec: 120 },
  { label: "3 min", sec: 180 },
  { label: "5 min", sec: 300 },
];

export default function FreeSpeaking() {
  const nav = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(120);

  useEffect(() => {
    (async () => {
      try {
        const r = await getFreePrompts();
        setPrompts(r.prompts);
        setSelected(r.prompts[0]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const shuffle = () => {
    setSelected(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const start = () => {
    if (!selected) return;
    nav("/practice", {
      state: { mode: "free", prompt: selected, durationSec: duration, title: "Free Speaking" },
    });
  };

  return (
    <div className="space-y-8 tf-slide-up">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Free Speaking</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          One prompt.<br /><span className="text-white/40">Speak your mind.</span>
        </h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-8">
        <div className="text-[10px] tracking-[0.24em] uppercase text-[#FFB067] mb-4">Your prompt</div>
        <p className="font-heading text-2xl md:text-3xl leading-snug" data-testid="free-prompt-text">{selected || "Loading..."}</p>
        <button
          data-testid="shuffle-prompt-btn"
          onClick={shuffle}
          className="mt-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <Shuffle className="h-4 w-4" /> Give me another prompt
        </button>
      </div>

      <div>
        <div className="text-[10px] tracking-[0.24em] uppercase text-white/40 mb-3">Session length</div>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.sec}
              data-testid={`duration-${d.sec}`}
              onClick={() => setDuration(d.sec)}
              className={`tf-focus rounded-full border px-4 py-2 text-sm transition-colors ${
                duration === d.sec
                  ? "border-[#FFB067] bg-[#FFB067]/10 text-[#FFB067]"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <button
        data-testid="start-free-speaking-btn"
        onClick={start}
        className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-6 py-3 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
      >
        <Play className="h-4 w-4" /> Start speaking
      </button>
    </div>
  );
}
