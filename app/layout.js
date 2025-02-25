import { AuthProvider } from "./Providers";
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import { Toaster } from "sonner";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://eventify.sairam.edu.in'),
  title: 'Eventify',
  description: 'The official event management platform for organizing and tracking academic events.',
  keywords: 'eventify sairam, sairam events, sairam college events, sri sairam engineering college events, event management system, college event platform',
  openGraph: {
    title: 'Eventify',
    description: 'The official event management platform for organizing and tracking academic events.',
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
  }
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-ZC06WK8GTF`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZC06WK8GTF');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Toaster richColors position="top-right" closeButton/>
        <AuthProvider>
          <Navbar />
          <div className="flex">
            <div>
            <Sidebar />
            </div>
            <div className="m-2 p-3 w-full">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
