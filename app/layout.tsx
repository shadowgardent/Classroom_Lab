import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Classroom Lab Portal',
  description: 'Classroom community portal with status updates and member directory.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="bg-sand-50">
      <body className="min-h-screen bg-transparent text-cocoa-700 selection:bg-primary-200 selection:text-cocoa-700">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
