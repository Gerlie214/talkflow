import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Play, Home, RotateCcw } from "lucide-react";
import { getRecording } from "@/lib/storage";
import { formatSeconds } from "@/lib/format";

export default function PracticeComplete() {
  const loc = useLocation();
  const nav = useNavigate();
  const state = useMemo(() => loc.state || {}, [loc.state]);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (!state?.title) {
      nav("/");
      return;
    }
    if (state.recordingSessionId) {
      const url = getRecording(state.recordingSessionId);
      if (url) setAudioUrl(url);
    }
  }, [state, nav]);

  const feedback = getFeedback(state.completionPct || 0, state.durationSec || 0);

  const practiceAgain = () => {
    nav("/practice", {
      state: {
        mode: state.mode,
        topicId: state.topicId,
        customScriptId: state.customScriptId,
        title: state.title,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-5 py-10 relative z-10">
      <div className="w-full max-w-2xl space-y-8 tf-slide-up">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#A3B19B]/10 border border-[#A3B19B]/30">
            <CheckCircle2 className="h-6 w-6 text-[#A3B19B]" />
          </div>
          <div className="text-[10px] tracking-[0.24em] uppercase text-white/40 mt-6">Session complete</div>
          <h1 className="font-heading text-4xl md:text-5xl font-medium mt-2 leading-tight max-w-lg">
            {state.title}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Duration" value={formatSeconds(state.durationSec || 0)} testid="complete-duration" />
          <Stat label="Completed" value={`${state.sentencesCompleted}/${state.sentencesTotal}`} testid="complete-sentences" />
          <Stat label="Completion" value={`${state.completionPct || 0}%`} testid="complete-percent" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6">
          <div className="text-[10px] tracking-[0.24em] uppercase text-[#FFB067]">Feedback</div>
          <p className="font-heading text-xl mt-2 leading-snug">{feedback.headline}</p>
          <p className="text-white/60 mt-2 font-body">{feedback.tip}</p>
        </div>

        {audioUrl && (
          <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6">
            <div className="text-[10px] tracking-[0.24em] uppercase text-white/40 mb-3">Playback</div>
            <audio controls src={audioUrl} className="w-full" data-testid="complete-audio-player" />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            data-testid="practice-again-btn"
            onClick={practiceAgain}
            className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Practice again
          </button>
          <Link
            to="/library"
            data-testid="browse-more-btn"
            className="tf-focus inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            <Play className="h-4 w-4" /> Try another
          </Link>
          <Link
            to="/"
            data-testid="back-home-btn"
            className="tf-focus inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, testid }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
    <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</div>
    <div className="font-heading text-2xl mt-1" data-testid={testid}>{value}</div>
  </div>
);

const getFeedback = (pct, sec) => {
  if (pct === 100 && sec > 30) {
    return {
      headline: "Beautifully done. You made it all the way through.",
      tip: "Try a slightly harder topic next, or turn on audio recording to catch pacing patterns.",
    };
  }
  if (pct >= 60) {
    return {
      headline: "Strong session. Momentum is building.",
      tip: "Repeat this topic once more to lock in the phrases that felt tough.",
    };
  }
  if (pct > 0) {
    return {
      headline: "Great start. Every minute counts.",
      tip: "Try a shorter session next and complete it end-to-end for a confidence boost.",
    };
  }
  return {
    headline: "Session logged.",
    tip: "Even quick warm-ups shape your rhythm. Try again with a fresh topic.",
  };
};
