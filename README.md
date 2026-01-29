# 國際新聞編輯工作台（RSS版, 零爬蟲）

這個專案是 Next.js App Router 專案，**完全不使用爬蟲**，僅使用：
- 各家官方 RSS（有就用）
- 沒有官方 RSS 時，改用 Google News RSS Search（仍是 RSS）

## 1) 安裝與啟動

進到本專案資料夾後：

```bash
npm install
npm run dev
```

打開瀏覽器：
- http://localhost:3000

## 2) 檢查 API 是否有回資料（除錯最好用）

- http://localhost:3000/api/aggregate
- http://localhost:3000/api/trends

## 3) 調整更新頻率（15–30 分鐘）

檔案：`app/page.tsx`

```ts
const REFRESH_MS = 20 * 60 * 1000; // 改成 15 或 30 分鐘即可
```

## 4) 調整來源（RSS only）

檔案：`lib/sources.ts`

- 有官方 RSS：直接填 `feedUrl`
- 沒有官方 RSS：用 `googleNewsRss("site:xxx 國際")` 組合

## 5) 注意

- Google News RSS Search 的結果是「Google 收錄的搜尋結果」，可能與原站「國際頻道」不完全一致。
