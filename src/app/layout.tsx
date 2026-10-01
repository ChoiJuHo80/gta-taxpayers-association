import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NtsFloatingWidget from '@/components/NtsFloatingWidget';
import ConsultFloatingWidget from '@/components/ConsultFloatingWidget';

export const metadata: Metadata = {
  title: ':: GTA (Geoje Taxpayers Committee) Official Website',
  description: 'Official Website of Geoje Taxpayers Committee (GTA) - Tax Relief & Counseling Platform',
  keywords: ['GTA', 'Geoje Taxpayers Committee', 'Korean tax law', 'Tax counseling', 'Expatriate tax'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased relative">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ConsultFloatingWidget />
        <NtsFloatingWidget />
      </body>
    </html>
  );
}
