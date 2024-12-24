"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import "./navbar.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function Navbar() {
  const { data: session } = useSession();
  const [print, setPrint] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const allowedPaths = [
      "/dashboard",
      "/manage",
      "/create",
      "/status",
      "/update",
      "/approve",
      "/report",
      "/profile",
      "/events",
      "events/[eventID]",
      "/venues",
    ];
    if (!allowedPaths.some((path) => pathname.startsWith(path))) {
      setPrint(false);
    } else {
      setPrint(true);
    }
  }, [pathname]);

  return (
    <>
      {print && (
        <>
          <nav className="flex justify-between items-center p-4 text-white">
            <Link href="/dashboard">
              <Image
                className="logo-img"
                src="/assets/images/logo.png"
                width={185}
                height={100}
                quality={100}
                alt="logo"
              />
            </Link>
            <div className="flex items-center text-black font-bold">
              {session && session.user && (
                <span className="mr-4">Hello, {session.user.name}</span>
              )}
              <button
                onClick={() => signOut()}
                className="sign-out-btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
              >
                <span>Sign out</span>
              </button>
            </div>
          </nav>
          <div className="spacer">&nbsp;</div>
        </>
      )}
    </>
  );
}

export default Navbar;
