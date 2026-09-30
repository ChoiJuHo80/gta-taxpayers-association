import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NtsFloatingWidget from '@/components/NtsFloatingWidget';

export const metadata: Metadata = {
  title: 'GTA 거제시 납세자회 - 공식 홈페이지',
  description: '거제시 납세자의 권익 보호와 공정한 세무 행정을 위한 거제시 납세자회 공식 홈페이지 및 무료 세무 상담 플랫폼',
  keywords: ['거제시납세자회', 'GTA', '거제세무상담', '양도소득세', '종합소득세', '상속세', '증여세'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col antialiased relative">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <NtsFloatingWidget />
      </body>
    </html>
  );
}
