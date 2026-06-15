import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "問いの庭",
  description: "問いと共に生きた軌跡を保存するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable}`}>
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}