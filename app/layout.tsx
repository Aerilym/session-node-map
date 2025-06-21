import type { Metadata } from 'next';
import { Roboto_Flex } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import { PrefProvider } from '@/providers/preferences-provider';
import QueryProvider from '@/providers/query-provider';

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Session Network Node Map',
  description: 'A 3D global visualisation of the Session Network',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <PrefProvider>
      <QueryProvider>
        <html lang="en">
          <body className={`${robotoFlex.variable} antialiased`}>{children}</body>
        </html>
      </QueryProvider>
    </PrefProvider>
  );
}
