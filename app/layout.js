import { ThemeProviders } from './Providers';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import LayoutContent from './LayoutContent';

export const metadata = {
  metadataBase: new URL('https://eventify.sairam.edu.in'),
  title: 'Eventify',
  description:
    'The official event management platform for organizing and tracking academic events.',
  keywords:
    'eventify sairam, sairam events, sairam college events, sri sairam engineering college events, event management system, college event platform',
  openGraph: {
    title: 'Eventify',
    description:
      'The official event management platform for organizing and tracking academic events.',
    images: ['/assets/images/logo-main.png'],
    url: 'https://eventify.sairam.edu.in',
    siteName: 'Eventify Sairam',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-ZC06WK8GTF`}
          strategy='afterInteractive'
        />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZC06WK8GTF');
          `}
        </Script>
      </head>
      <body
        className={`${GeistSans.className} ${GeistMono.variable} antialiased`}
      >
        <Toaster richColors position='top-right' closeButton />
        <ThemeProviders>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProviders>
      </body>
    </html>
  );
}
