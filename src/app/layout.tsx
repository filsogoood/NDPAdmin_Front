import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NDP Admin - 노드 관리 시스템',
  description: 'NDP 네트워크의 하드웨어 노드 관리 시스템',
  authors: [{ name: 'ZetaCube' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} antialiased bg-gray-900 text-gray-100`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
