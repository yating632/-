import "./globals.css";

export const metadata = {
  title: "國際新聞編輯工作台",
  description: "RSS-only international news editor desk with Google Trends sidebar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
