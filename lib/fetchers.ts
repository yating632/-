import Parser from "rss-parser";
import type { Source } from "./sources";

export type NewsItem = {
  title: string;
  link: string;
  publishedAt?: string;
};

const rssParser = new Parser({
  timeout: 12_000,
  headers: {
    "User-Agent": "IntlNewsDeskBot/1.0",
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  },
});

// Google News RSS 的 item.link 會是 news.google.com 的中繼網址。
// 為了讓你點擊後直接到「原始媒體」文章，這裡會跟隨一次 redirect 取得最終 URL。
async function resolveGoogleNewsLink(url: string): Promise<string> {
  try {
    if (!/^https?:\/\/news\.google\.com\//i.test(url)) return url;

    // 用 GET 而不是 HEAD：有些站對 HEAD 會回 405
    const res = await fetch(url, { redirect: "follow" });
    return res.url || url;
  } catch {
    return url;
  }
}

async function mapLimit<T, R>(arr: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, arr.length) }).map(async () => {
    while (idx < arr.length) {
      const my = idx++;
      out[my] = await fn(arr[my]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function fetchNews(source: Source): Promise<NewsItem[]> {
  try {
    const feed = await rssParser.parseURL(source.feedUrl);
    const raw = (feed.items || [])
      .slice(0, 10)
      .map((it) => ({
        title: (it.title || "").trim(),
        link: (it.link || "").trim(),
        publishedAt: (it.isoDate || it.pubDate || "").trim() || undefined,
      }))
      .filter((x) => x.title && x.link);

    // 限制並發，避免一次對太多連結做 redirect 解析
    return await mapLimit(raw, 5, async (it) => ({
      ...it,
      link: await resolveGoogleNewsLink(it.link),
    }));
  } catch {
    return [];
  }
}
