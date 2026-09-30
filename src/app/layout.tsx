import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NtsFloatingWidget from '@/components/NtsFloatingWidget';

export const metadata: Metadata = {
  title: ':: GTA (거제 납세자 대책위원회) 공식 홈페이지',
  description: '거제 납세자 대책위원회(GTA) 공식 홈페이지 및 1:1 온라인 세무 상담·소명 플랫폼',
  keywords: ['GTA', '거제납세자대책위원회', '거제세무상담', '양도소득세', '종합소득세', '상속세', '증여세', '지방세'],
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
