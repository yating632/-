"use client";

import { useEffect, useMemo, useState } from "react";

type NewsItem = { title: string; link: string; publishedAt?: string };
type SourceBlock = {
  id: string;
  name: string;
  column: "left" | "middle";
  moreUrl: string;
  items: NewsItem[];
};

type AggregateResp = { updatedAt: string; sources: SourceBlock[] };
type Trend = { rank: number; keyword: string; link: string };
type TrendsResp = { updatedAt: string; trends: Trend[] };

// 15–30 分鐘：這裡預設 20 分鐘
const REFRESH_MS = 20 * 60 * 1000;

function fmtTime(raw?: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yy}/${mm}/${dd} ${hh}:${mi}`;
  }
  return raw;
}

export default function Page() {
  const [data, setData] = useState<AggregateResp | null>(null);
  const [trends, setTrends] = useState<TrendsResp | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        fetch("/api/aggregate", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/trends", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setData(a);
      setTrends(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const left = useMemo(
    () => (data?.sources || []).filter((s) => s.column === "left"),
    [data]
  );
  const middle = useMemo(
    () => (data?.sources || []).filter((s) => s.column === "middle"),
    [data]
  );

  return (
    <main className="wrap">
      <header className="topbar">
        <div className="title">國際新聞編輯工作台（RSS版,零爬蟲）</div>
        <div className="meta">
          <span>{loading ? "更新中…" : "已更新"}</span>
          <span className="dot">•</span>
          <span>{data?.updatedAt ? fmtTime(data.updatedAt) : "-"}</span>
        </div>
      </header>

      <div className="layout">
        <section className="newsGrid">
          {Array.from({ length: Math.max(left.length, middle.length) }).map((_, i) => (
            <div className="row2" key={i}>
              <MediaBlock block={left[i]} />
              <MediaBlock block={middle[i]} />
            </div>
          ))}
        </section>

        <aside className="trend">
          <div className="trendHeader">
            <div className="trendTitle">Google Trends 台灣熱搜</div>
            <div className="trendMeta">{trends?.updatedAt ? fmtTime(trends.updatedAt) : "-"}</div>
          </div>

          <ol className="trendList">
            {(trends?.trends || []).slice(0, 10).map((t) => (
              <li key={t.rank} className="trendItem">
                <span className="rank">{t.rank}</span>
                <a className="kw" href={t.link} target="_blank" rel="noreferrer">
                  {t.keyword}
                </a>
              </li>
            ))}
          </ol>

          <a
            className="trendMore"
            href="https://trends.google.com/trending?geo=TW&hl=zh-TW"
            target="_blank"
            rel="noreferrer"
          >
            看更多
          </a>
        </aside>
      </div>
    </main>
  );
}

function MediaBlock({ block }: { block?: SourceBlock }) {
  if (!block) return <div className="card empty" />;

  return (
    <div className="card">
      <div className="cardHeader">{block.name}</div>

      <ul className="list">
        {(block.items || []).slice(0, 10).map((it, idx) => (
          <li key={idx} className="item">
            <div className="time">{fmtTime(it.publishedAt)}</div>
            <a className="link" href={it.link} target="_blank" rel="noreferrer">
              {it.title}
            </a>
          </li>
        ))}
      </ul>

      <a className="moreBtn" href={block.moreUrl} target="_blank" rel="noreferrer">
        看更多
      </a>
    </div>
  );
}
