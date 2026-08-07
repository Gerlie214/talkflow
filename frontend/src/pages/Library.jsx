import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { listTopics, listCategories } from "@/lib/api";

const DIFFS = ["all", "beginner", "intermediate", "advanced"];

export default function Library() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    (async () => {
      const [t, c] = await Promise.all([listTopics(), listCategories()]);
      setTopics(t);
      setCategories([{ name: "All", count: t.length }, ...c]);
    })();
  }, []);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      const inCat = category === "All" || t.category === category;
      const inDiff = difficulty === "all" || t.difficulty === difficulty;
      const inQ = !q || t.title.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase());
      return inCat && inDiff && inQ;
    });
  }, [topics, category, difficulty, q]);

  return (
    <div className="space-y-8 tf-slide-up">
      <div>
        <div className="text-xs tracking-[0.24em] uppercase text-white/40">Topic Library</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-medium mt-2 leading-tight">
          Pick a script.<br /><span className="text-white/40">Start speaking.</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            data-testid="library-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics..."
            className="tf-focus w-full rounded-full border border-white/10 bg-[#121214] pl-11 pr-5 py-3 text-sm placeholder:text-white/30 font-body"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.name}
              data-testid={`category-filter-${c.name.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => setCategory(c.name)}
              className={`tf-focus rounded-full border px-4 py-1.5 text-xs font-body transition-colors ${
                category === c.name
                  ? "border-[#FFB067] bg-[#FFB067]/10 text-[#FFB067]"
                  : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"
              }`}
            >
              {c.name} <span className="text-white/30 ml-1">{c.count}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFFS.map((d) => (
            <button
              key={d}
              data-testid={`difficulty-filter-${d}`}
              onClick={() => setDifficulty(d)}
              className={`tf-focus rounded-full px-3 py-1 text-[10px] tracking-[0.22em] uppercase transition-colors ${
                difficulty === d
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Link
            key={t.id}
            to={`/topic/${t.id}`}
            data-testid={`topic-card-${t.id}`}
            className="group rounded-2xl border border-white/10 bg-[#121214] p-6 hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#18181B] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.24em] uppercase text-[#FFB067]/90">{t.category}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">{t.difficulty}</span>
            </div>
            <h3 className="font-heading text-xl font-medium mt-3 leading-tight">{t.title}</h3>
            <p className="text-sm text-white/50 mt-2 line-clamp-2 font-body">{t.description}</p>
            <div className="flex items-center justify-between mt-6 text-xs text-white/40">
              <span>{t.duration_min} min</span>
              <span>{t.sentences.length} lines</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-white/40 py-16">No topics match your filters.</div>
        )}
      </div>
    </div>
  );
}
