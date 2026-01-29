import { NextResponse } from "next/server";
import { SOURCES } from "@/lib/sources";
import { fetchNews } from "@/lib/fetchers";

export const runtime = "nodejs";

export async function GET() {
  const results = await Promise.all(
    SOURCES.map(async (s) => {
      const items = await fetchNews(s);
      return {
        id: s.id,
        name: s.name,
        column: s.column,
        moreUrl: s.moreUrl,
        items,
      };
    })
  );

  return NextResponse.json(
    { updatedAt: new Date().toISOString(), sources: results },
    {
      headers: {
        // 5 分鐘快取 + 5 分鐘 SWR，搭配前端每 20 分鐘刷新
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    }
  );
}
