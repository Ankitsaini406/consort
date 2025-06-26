import type { Metadata } from "next";
import "./globals.css";
import LayoutWithMenu from "@/components/layout/LayoutWithMenu";
import { Inter, Manrope } from 'next/font/google';
import { AlertProvider } from '@/context/AlertContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProviders } from "@/context/ClientProviders";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.consortdigital.com'),
  title: 'MCX ONE™ - Trusted Excellence in Mission Critical Communications | Consort',
  description: 'MCX ONE™ offers future-ready stack for mission critical success with 20+ years of uncompromising reliability in TETRA, DMR, FRMCS, LTE 4G & 5G solutions.',
  keywords: 'MCX ONE, mission critical communications, TETRA, DMR, LTE, 5G, Consort, FRMCS, emergency communications, public safety',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Consort Digital - MCX ONE™ - Mission Critical Communications | Consort',
    description: 'Future-ready stack for mission critical success. Trusted by 100+ critical projects worldwide.',
    images: ['/consort_OG.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consort Digital - MCX ONE™ - Mission Critical Communications',
    description: 'Future-ready stack for mission critical success',
    images: ['/consort_OG.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch for external resources */}
        {/* <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" /> */}
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} min-h-screen bg-default-background font-sans text-default-font antialiased`}>
        <ClientProviders>
        <div className="flex min-h-screen flex-col">
          {/* <ModernNavbar2 /> */}
            <LayoutWithMenu>
              {children}
            </LayoutWithMenu>
        </div>
        </ClientProviders>
      </body>
    </html>
  );
}
