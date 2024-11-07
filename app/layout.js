import { AuthProvider } from "./Providers";
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/navbar";
import Sidebar from "@/components/Sidebar/sidebar";
import { Toaster } from "sonner";
// import { useState , useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Eventify",
  description: "Manage all your events",
};

export default function RootLayout({ children }) {
  // const [showToaster, setShowToaster] = useState(false);

  // useEffect(() => {
  //   if (showToaster) {
  //     const timerId = setTimeout(() => {
  //       setShowToaster(false);
  //     }, 2000);

  //     return () => clearTimeout(timerId);
  //   }
  // }, [showToaster]);

  return (
    <html lang="en">
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
