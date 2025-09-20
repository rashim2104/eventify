import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Eventify',
  description: 'Manage all your events',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Toaster richColors position='top-right' closeButton />

        <div>{children}</div>
      </body>
    </html>
  );
}
