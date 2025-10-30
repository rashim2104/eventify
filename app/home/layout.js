import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { GeistSans } from 'geist/font/sans';

export const metadata = {
  title: 'Eventify',
  description: 'Manage all your events',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${GeistSans.className} antialiased`}>
        <Toaster richColors position='top-right' closeButton />

        <div>{children}</div>
      </body>
    </html>
  );
}
