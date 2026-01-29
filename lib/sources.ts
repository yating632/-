export type Column = "left" | "middle";

export type Source = {
  id: string;
  name: string;
  column: Column;
  feedUrl: string; // RSS only
  moreUrl: string; // 「看更多」跳轉
};

const googleNewsRss = (query: string) => {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
};

// Google News RSS 可能混入較舊文章
// 建議在 query 裡加上 when:1d / when:2d 之類的時間限制，讓連結更「新」
const googleNewsRssRecent = (query: string, when: "1d" | "2d" | "3d" | "7d" = "2d") => {
  // 若使用者已自行指定 when:，就不重複加
  const hasWhen = /\bwhen:\d+d\b/i.test(query);
  return googleNewsRss(hasWhen ? query : `${query} when:${when}`);
};

// 版面：左欄、 中欄（每列兩個區塊）
// 來源：你提供的 8 家，完全不使用爬蟲，只有 RSS（官方RSS優先，否則用 Google News RSS）
export const SOURCES: Source[] = [
  // ===== 左欄（依序向下）=====
  {
    id: "cna",
    name: "中央社",
    column: "left",
    feedUrl: "https://feeds.feedburner.com/rsscna/intworld",
    moreUrl: "https://www.cna.com.tw/list/aopl.aspx",
  },
  {
    id: "ltn",
    name: "自由時報",
    column: "left",
    feedUrl: "https://news.ltn.com.tw/rss/world.xml",
    moreUrl: "https://news.ltn.com.tw/list/breakingnews/world",
  },
  {
    id: "nextapple",
    name: "壹蘋新聞網",
    column: "left",
    // 盡量只抓「國際」頻道（用 inurl 限制 + when 限定近期）
    feedUrl: googleNewsRssRecent(
      "site:news.nextapple.com inurl:realtime/international",
      "2d"
    ),
    moreUrl: "https://news.nextapple.com/realtime/international",
  },
  {
    id: "setn",
    name: "三立新聞網",
    column: "left",
    // 三立沒有公開穩定的國際 RSS 時，改用 Google News RSS 並用 PageGroupID=5 近似「國際」
    feedUrl: googleNewsRssRecent(
      "site:setn.com inurl:News.aspx (PageGroupID=5 OR pagegroupid=5)",
      "2d"
    ),
    moreUrl: "https://www.setn.com/catalog.aspx?pagegroupid=5",
  },
  {
    id: "mirrordaily",
    name: "鏡報",
    column: "left",
    feedUrl: googleNewsRssRecent("site:mirrordaily.news inurl:/section/int", "2d"),
    moreUrl: "https://www.mirrordaily.news/section/int",
  },

  // ===== 中欄（依序向下）=====
  {
    id: "udn",
    name: "聯合新聞網",
    column: "middle",
    // 官方「國際」RSS（若你更想對齊 breaknews 區塊，可改用 googleNewsRss）
    feedUrl: "https://udn.com/news/rssfeed/7225",
    moreUrl: "https://udn.com/news/breaknews/1/5#breaknews",
  },
  {
    id: "chinatimes",
    name: "中時新聞網",
    column: "middle",
    // 中時 RSS 近年常變動，先用 Google News RSS + inurl 限制「world」 + when
    feedUrl: googleNewsRssRecent("site:chinatimes.com inurl:/world/", "2d"),
    moreUrl: "https://www.chinatimes.com/world/",
  },
  {
    id: "taisounds",
    name: "太報",
    column: "middle",
    // 用 section/83 + when，避免撈到舊文
    feedUrl: googleNewsRssRecent("site:taisounds.com section/83", "2d"),
    moreUrl: "https://www.taisounds.com/news/section/83",
  },
  {
    id: "tvbs",
    name: "TVBS",
    column: "middle",
    // TVBS 國際頁面 URL：/world
    feedUrl: googleNewsRssRecent("site:news.tvbs.com.tw inurl:/world/", "1d"),
    moreUrl: "https://news.tvbs.com.tw/world",
  },
  {
    id: "ctwant",
    name: "周刊王（CTWANT）",
    column: "middle",
    // CTWANT 搜尋索引有時不穩，先用關鍵字 + site 限制 + when
    feedUrl: googleNewsRssRecent("site:ctwant.com (國際 OR 國外 OR world)", "2d"),
    moreUrl: "https://www.ctwant.com/",
  },
  {
    id: "worldjournal",
    name: "世界日報",
    column: "middle",
    // 世界日報有官方 RSS feed（數字代碼會對應不同頻道）
    feedUrl: "https://www.worldjournal.com/wj/rssfeed/121010",
    moreUrl: "https://www.worldjournal.com/wj/cate/breaking",
  },
];

export const LEFT = SOURCES.filter((s) => s.column === "left");
export const MIDDLE = SOURCES.filter((s) => s.column === "middle");
