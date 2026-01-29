import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const runtime = "nodejs";

const parser = new Parser({
  timeout: 12_000,
  headers: {
    "User-Agent": "IntlNewsDeskBot/1.0",
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  },
});

// Google Trends 台灣（每日熱搜榜）
// 注意：/trending/rss 有時會和 trends.google.com 網頁看到的榜單不一致，
// 這裡改用官方 daily RSS 端點，與「每日熱搜」頁面更接近。
const TRENDS_RSS_TW =
  "https://trends.google.com/trends/trendingsearches/daily/rss?geo=TW&hl=zh-TW";

export async function GET() {
  try {
    const feed = await parser.parseURL(TRENDS_RSS_TW);

    const top10 = (feed.items || []).slice(0, 10).map((it, idx) => {
      const keyword = (it.title || "").trim();
      const link =
        it.link ||
        `https://trends.google.com/trending?geo=TW&hl=zh-TW`;

      return { rank: idx + 1, keyword, link };
    });

    return NextResponse.json(
      { updatedAt: new Date().toISOString(), trends: top10 },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ updatedAt: new Date().toISOString(), trends: [] });
  }
}
