/**
 * @file Root layout for the Needs Research App UI shell.
 * @remarks Keep this component compatible with future Next.js layout features when integrating real backend data.
 */
import { ReactNode } from "react";

import type { Metadata } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ニーズ調査AIダッシュボード",
  description:
    "仮想ユーザーによるニーズ検証ワークスペース。ダミーデータでUIを確認できます。"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
