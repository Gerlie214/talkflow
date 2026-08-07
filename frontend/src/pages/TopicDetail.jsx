import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, PlayCircle, Clock, Layers, Gauge } from "lucide-react";
import { getTopic } from "@/lib/api";
import { pushRecent } from "@/lib/storage";

export default function TopicDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const t = await getTopic(id);
        setTopic(t);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!topic) return <div className="text-white/50">Loading...</div>;

  const start = () => {
    pushRecent({ id: topic.id, title: topic.title, topicId: topic.id, mode: "guided" });
    nav("/practice", { state: { mode: "guided", topicId: topic.id, title: topic.title } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 tf-slide-up">
      <Link to="/library" data-testid="back-to-library" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-[#FFB067]/90">{topic.category}</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">{topic.title}</h1>
        <p className="text-white/60 mt-4 max-w-2xl font-body">{topic.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Meta icon={Gauge} label="Difficulty" value={topic.difficulty} />
        <Meta icon={Clock} label="Duration" value={`${topic.duration_min} min`} />
        <Meta icon={Layers} label="Lines" value={topic.sentences.length} />
      </div>

      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40 mb-3">Preview</div>
        <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-6 space-y-3">
          {topic.sentences.slice(0, 3).map((s, i) => (
            <p key={i} className="text-white/70 font-body leading-relaxed">
              <span className="text-white/30 mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>{s}
            </p>
          ))}
          {topic.sentences.length > 3 && (
            <p className="text-white/30 text-sm">+ {topic.sentences.length - 3} more sentences during practice</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          data-testid="start-practice-btn"
          onClick={start}
          className="tf-focus inline-flex items-center gap-2 rounded-full bg-[#FFB067] px-6 py-3 text-sm font-medium text-black hover:bg-[#FF9D42] transition-colors"
        >
          <PlayCircle className="h-4 w-4" /> Start practice
        </button>
      </div>
    </div>
  );
}

const Meta = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white/40">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="font-heading text-lg mt-1 capitalize">{value}</div>
  </div>
);
