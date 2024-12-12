import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import MsalProvider from '../components/MsalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Access Request Form',
  description: 'Hubtel Access Request Form',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MsalProvider>
          {children}
          <Toaster position="top-center" />
        </MsalProvider>
      </body>
    </html>
  );
}