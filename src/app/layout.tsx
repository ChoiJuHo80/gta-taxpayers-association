import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NtsFloatingWidget from '@/components/NtsFloatingWidget';
import ConsultFloatingWidget from '@/components/ConsultFloatingWidget';

export const metadata: Metadata = {
  title: ':: GTA (Geoje Taxpayers Association) Official Website',
  description: 'Official Website of Geoje Taxpayers Association (GTA) - Tax Relief & Counseling Platform',
  keywords: ['GTA', 'Geoje Taxpayers Association', 'Korean tax law', 'Tax counseling', 'Expatriate tax'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen print:min-h-0 flex flex-col antialiased relative">
        <Header />
        <main className="flex-1">{children}</main>
        <div className="print:hidden">
          <Footer />
          <ConsultFloatingWidget />
          <NtsFloatingWidget />
        </div>
      </body>
    </html>
  );
}
