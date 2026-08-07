import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X, Mic, Square } from "lucide-react";
import { getTopic, getCustomScript, createSession, getFreePrompts } from "@/lib/api";
import { getSettings, saveRecording, pushRecent } from "@/lib/storage";
import { useRecorder } from "@/hooks/useRecorder";
import { formatSeconds } from "@/lib/format";
import { toast } from "sonner";

/**
 * Route state:
 *  - mode: "guided" | "custom" | "free"
 *  - topicId (guided) | customScriptId (custom) | prompt & durationSec (free)
 *  - title
 */
export default function Practice() {
  const nav = useNavigate();
  const loc = useLocation();
  const state = loc.state || {};
  const settings = getSettings();

  const [sentences, setSentences] = useState([]);
  const [title, setTitle] = useState(state.title || "Practice");
  const [prompt, setPrompt] = useState(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ready, setReady] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const freeDurationSec = state.durationSec || settings.defaultSessionMinutes * 60;

  const recorder = useRecorder();
  const timerRef = useRef(null);
  const autoAdvRef = useRef(null);

  const isFree = state.mode === "free";

  // Load content
  useEffect(() => {
    (async () => {
      try {
        if (state.mode === "guided" && state.topicId) {
          const t = await getTopic(state.topicId);
          setSentences(t.sentences);
          setTitle(t.title);
        } else if (state.mode === "custom" && state.customScriptId) {
          const cs = await getCustomScript(state.customScriptId);
          const lines = cs.content
            .replace(/([.!?])\s+/g, "$1|")
            .split(/[|\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          setSentences(lines);
          setTitle(cs.title);
        } else if (state.mode === "custom" && state.customContent) {
          const lines = state.customContent
            .replace(/([.!?])\s+/g, "$1|")
            .split(/[|\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          setSentences(lines);
        } else if (state.mode === "free") {
          if (state.prompt) setPrompt(state.prompt);
          else {
            const r = await getFreePrompts();
            setPrompt(r.prompts[Math.floor(Math.random() * r.prompts.length)]);
          }
        } else {
          nav("/");
          return;
        }
        setReady(true);
      } catch (e) {
        console.error(e);
        toast.error("Could not load practice content");
        nav("/library");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  // Auto-advance for guided/custom
  useEffect(() => {
    clearTimeout(autoAdvRef.current);
    if (!isFree && playing && settings.autoAdvance && ready && sentences.length > 0) {
      autoAdvRef.current = setTimeout(() => {
        setIdx((i) => (i < sentences.length - 1 ? i + 1 : i));
      }, settings.autoAdvanceSeconds * 1000);
    }
    return () => clearTimeout(autoAdvRef.current);
  }, [playing, idx, sentences.length, settings.autoAdvance, settings.autoAdvanceSeconds, ready, isFree]);

  // Free mode auto-finish
  useEffect(() => {
    if (isFree && playing && elapsed >= freeDurationSec) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, isFree, playing]);

  // Complete when past last sentence
  useEffect(() => {
    if (!isFree && ready && sentences.length > 0 && idx >= sentences.length) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, sentences.length, ready, isFree]);

  const start = () => setPlaying(true);
  const pause = () => setPlaying(false);
  const restart = () => {
    setIdx(0);
    setElapsed(0);
    setPlaying(true);
  };
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min((sentences.length || 1) - 1, i + 1) + (i >= sentences.length - 1 ? 1 : 0));

  const toggleRec = async () => {
    if (recorder.recording) {
      recorder.stop();
    } else {
      const ok = await recorder.start();
      if (!ok && recorder.error) toast.error(recorder.error);
    }
  };

  const finish = useCallback(async () => {
    setPlaying(false);
    if (recorder.recording) recorder.stop();

    const sentencesTotal = isFree ? 1 : sentences.length;
    const completed = isFree ? 1 : Math.min(sentences.length, idx);
    const pct = sentencesTotal > 0 ? Math.round((completed / sentencesTotal) * 100) : 0;

    let sessionResult = null;
    try {
      sessionResult = await createSession({
        mode: state.mode,
        topic_id: state.topicId || null,
        topic_title: title,
        duration_sec: elapsed,
        sentences_total: sentencesTotal,
        sentences_completed: completed,
        completion_pct: pct,
        audio_saved: !!recorder.audioBlob,
      });
      if (recorder.audioBlob && sessionResult?.id) {
        await saveRecording(sessionResult.id, recorder.audioBlob);
      }
      pushRecent({
        id: state.topicId || state.customScriptId || "free",
        title,
        topicId: state.topicId,
        customScriptId: state.customScriptId,
        mode: state.mode,
      });
    } catch (e) {
      console.error(e);
      toast.error("Could not save session");
    }

    nav("/complete", {
      state: {
        session: sessionResult,
        recordingSessionId: sessionResult?.id,
        title,
        mode: state.mode,
        topicId: state.topicId,
        customScriptId: state.customScriptId,
        durationSec: elapsed,
        sentencesTotal,
        sentencesCompleted: completed,
        completionPct: pct,
      },
    });
  }, [elapsed, idx, isFree, nav, recorder, sentences.length, state, title]);

  const exit = () => setShowExit(true);
  const confirmExit = () => {
    if (recorder.recording) recorder.stop();
    nav("/");
  };

  const progressPct = useMemo(() => {
    if (isFree) return Math.min(100, Math.round((elapsed / freeDurationSec) * 100));
    if (!sentences.length) return 0;
    return Math.round((idx / sentences.length) * 100);
  }, [isFree, elapsed, freeDurationSec, idx, sentences.length]);

  if (!ready) {
    return <div className="min-h-screen grid place-items-center text-white/50">Loading practice...</div>;
  }

  return (
    <div className="fixed inset-0 bg-[#09090B] text-white flex flex-col z-40" data-testid="practice-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.24em] uppercase text-white/40">
            {isFree ? "Free Speaking" : state.mode === "custom" ? "Custom Script" : "Guided Practice"}
          </div>
          <div className="font-heading text-lg truncate max-w-[60vw]">{title}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] tracking-[0.24em] uppercase text-white/40">
              {isFree ? "Time" : "Elapsed"}
            </div>
            <div className="font-heading text-xl tabular-nums" aria-live="polite" data-testid="practice-timer">
              {isFree ? `${formatSeconds(elapsed)} / ${formatSeconds(freeDurationSec)}` : formatSeconds(elapsed)}
            </div>
          </div>
          <button
            onClick={exit}
            data-testid="exit-practice-btn"
            className="tf-focus rounded-full border border-white/10 p-2 text-white/60 hover:text-white hover:border-white/30 transition-colors"
            aria-label="Exit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/[0.06]">
        <div
          className="h-full bg-[#FFB067] transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
          data-testid="practice-progress-bar"
        />
      </div>

      {/* Teleprompter / Prompt */}
      <div className="flex-1 relative overflow-hidden mask-fade-y">
        <div className="h-full w-full flex items-center justify-center px-6 md:px-16">
          {isFree ? (
            <div className="max-w-3xl text-center">
              <div className="text-[10px] tracking-[0.24em] uppercase text-[#FFB067] mb-6">Prompt</div>
              <p className="font-heading text-3xl md:text-5xl leading-tight font-medium">
                {prompt}
              </p>
              <p className="text-white/40 mt-8 font-body">Speak freely until the timer ends. Take your time.</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar" data-testid="teleprompter-container">
                {sentences.map((s, i) => {
                  const isActive = i === idx;
                  const isDone = i < idx;
                  return (
                    <p
                      key={i}
                      data-testid={`sentence-${i}`}
                      className={
                        isActive
                          ? "font-heading text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-white transition-colors duration-300"
                          : isDone
                          ? "font-heading text-xl md:text-2xl font-medium leading-relaxed text-[#A3B19B]/40 transition-colors duration-500"
                          : "font-heading text-xl md:text-2xl font-medium leading-relaxed text-white/25 transition-colors duration-500"
                      }
                    >
                      {s}
                    </p>
                  );
                })}
              </div>
              <div className="mt-6 text-xs text-white/40 tracking-wider" aria-live="polite">
                Sentence <span data-testid="sentence-counter">{Math.min(idx + 1, sentences.length)}</span> of {sentences.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control pill */}
      <div className="pb-8 pt-4 flex justify-center">
        <div className="tf-glass rounded-full px-3 py-2 flex items-center gap-1.5 shadow-2xl">
          <PillBtn label="Restart" testid="ctrl-restart" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
          </PillBtn>
          {!isFree && (
            <PillBtn label="Previous" testid="ctrl-prev" onClick={prev} disabled={idx === 0}>
              <SkipBack className="h-4 w-4" />
            </PillBtn>
          )}
          {playing ? (
            <button
              onClick={pause}
              data-testid="ctrl-pause"
              className="tf-focus mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
              aria-label="Pause"
            >
              <Pause className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={start}
              data-testid="ctrl-play"
              className="tf-focus mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFB067] text-black hover:bg-[#FF9D42] transition-colors"
              aria-label="Play"
            >
              <Play className="h-5 w-5 ml-0.5" />
            </button>
          )}
          {!isFree && (
            <PillBtn label="Next" testid="ctrl-next" onClick={next} disabled={idx >= sentences.length - 1}>
              <SkipForward className="h-4 w-4" />
            </PillBtn>
          )}
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={toggleRec}
            data-testid="ctrl-record"
            aria-label={recorder.recording ? "Stop recording" : "Record"}
            className={`tf-focus relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              recorder.recording
                ? "border-[#FFB067] text-[#FFB067]"
                : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {recorder.recording && <span className="tf-recording-glow" />}
            <span className="relative">
              {recorder.recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
            </span>
          </button>
          <PillBtn label="Finish" testid="ctrl-finish" onClick={finish}>
            <span className="text-xs px-1 tracking-wider">FINISH</span>
          </PillBtn>
        </div>
      </div>

      {/* Exit confirmation */}
      {showExit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center px-6" data-testid="exit-dialog">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-[#0F0F11] p-6 tf-slide-up">
            <div className="font-heading text-xl">Exit practice?</div>
            <p className="text-white/50 mt-2 text-sm">Your session will not be saved.</p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                data-testid="exit-cancel-btn"
                onClick={() => setShowExit(false)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Keep going
              </button>
              <button
                data-testid="exit-confirm-btn"
                onClick={confirmExit}
                className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PillBtn = ({ children, onClick, disabled, label, testid }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    data-testid={testid}
    aria-label={label}
    className="tf-focus flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);
