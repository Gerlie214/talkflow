import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Play, Trash2, Plus } from "lucide-react";
import { createCustomScript, listCustomScripts, deleteCustomScript } from "@/lib/api";
import { pushRecent } from "@/lib/storage";

const SAMPLE = `Hi everyone, thank you for joining today.
I want to walk you through the three biggest updates from this quarter.
First, we shipped the new onboarding flow and saw a real lift in activation.
Second, our support response time is now under two hours on average.
Finally, we are kicking off a new pilot with three key partners next month.
Happy to take questions at the end.`;

export default function CustomScriptPage() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const list = await listCustomScripts();
      setSaved(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const practiceNow = () => {
    if (!content.trim()) {
      toast.error("Please add some text first");
      return;
    }
    nav("/practice", {
      state: {
        mode: "custom",
        customContent: content,
        title: title || "Custom Script",
      },
    });
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      await createCustomScript({ title: title.trim(), content: content.trim() });
      toast.success("Script saved");
      setTitle("");
      setContent("");
      await load();
    } catch (e) {
      toast.error("Could not save script");
    } finally {
      setSaving(false);
    }
  };

  const removeScript = async (id) => {
    try {
      await deleteCustomScript(id);
      await load();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  const runSaved = (s) => {
    pushRecent({ id: s.id, title: s.title, customScriptId: s.id, mode: "custom" });
    nav("/practice", { state: { mode: "custom", customScriptId: s.id, title: s.title } });
  };

  return (
    <div className="space-y-8 tf-slide-up">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Custom Script</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          Paste your script.<br /><span className="text-white/40">We&apos;ll turn it into practice.</span>
        </h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <input
            data-testid="custom-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this script a title..."
            className="tf-focus w-full rounded-xl border border-white/10 bg-[#121214] px-5 py-3 font-body text-sm placeholder:text-white/30"
          />
          <textarea
            data-testid="custom-content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={SAMPLE}
            rows={14}
            className="tf-focus w-full rounded-xl border border-white/10 bg-[#121214] px-5 py-4 font-body text-sm placeholder:text-white/25 leading-relaxed resize-y"
          />
          <div className="flex flex-wrap gap-3">
            <button
              data-testid="custom-practice-now-btn"
              onClick={practiceNow}
              className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
            >
              <Play className="h-4 w-4" /> Practice now
            </button>
            <button
              data-testid="custom-save-btn"
              onClick={save}
              disabled={saving}
              className="tf-focus inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Save script
            </button>
            <button
              data-testid="custom-load-sample-btn"
              onClick={() => setContent(SAMPLE)}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Load sample
            </button>
          </div>
        </div>

        <aside className="lg:col-span-2 space-y-3">
          <div className="text-xs tracking-[0.24em] uppercase text-white/40">Your scripts</div>
          {saved.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/40">
              Saved scripts appear here.
            </div>
          )}
          {saved.map((s) => (
            <div
              key={s.id}
              data-testid={`saved-script-${s.id}`}
              className="rounded-xl border border-white/10 bg-[#121214] p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-heading text-sm truncate">{s.title}</div>
                <div className="text-xs text-white/40 line-clamp-1">{s.content}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => runSaved(s)}
                  data-testid={`saved-script-play-${s.id}`}
                  aria-label="Practice"
                  className="tf-focus rounded-full p-2 text-white/70 hover:text-[#FFB067] transition-colors"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeScript(s.id)}
                  data-testid={`saved-script-delete-${s.id}`}
                  aria-label="Delete"
                  className="tf-focus rounded-full p-2 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
