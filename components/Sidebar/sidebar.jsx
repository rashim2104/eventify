"use client";
import './sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar(){
  const [print,setPrint] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    const allowedPaths = ["/dashboard","/manage", "/create", "/status", "/update", "/approve", "/report", "/profile","/events","/pastevents","events/[eventID]","pastevents/[eventID]", "/venues"];
    if (!allowedPaths.some(path => pathname.startsWith(path))) {
      setPrint(false);
    } else {
      setPrint(true);
    }
  }, [pathname]);

  const { data: session, status } = useSession();
  if (status === "loading") {
    // return <div className="grid place-items-center h-screen text-xl font-extrabold">Loading...</div>;
    return null;
  }
  const currUser= session?.user?.userType;
  return (
    <div className='sidebar-container bg-white'>
      { print && (
        <>
        <input hidden className="check-icon" id="check-icon" name="check-icon" type="checkbox" />
      <label className="icon-menu" htmlFor="check-icon">
        <div className="bar bar--1"></div>
        <div className="bar bar--2"></div>
        <div className="bar bar--3"></div>
      </label>
      <div className="overlay">
        <ul className='menu-list'>
          <Link className={`menu-list-item ${pathname === '/dashboard' ? 'opt-active' : ''}`} href="/dashboard" ><Image src="/assets/icons/home.png" className="menu-list-icon" width={25} height={25} alt='' />Home</Link>
          {(currUser === 'HOD' || currUser === 'staff') && (
          <>
          <Link className={`menu-list-item ${pathname === '/create' ? 'opt-active' : ''}`} href="/create" ><Image src="/assets/icons/create.png" className="menu-list-icon" width={25} height={25} alt='' />Create</Link>
          <Link className={`menu-list-item ${pathname === '/status' ? 'opt-active' : ''}`} href="/status"><Image src="/assets/icons/status.png" className="menu-list-icon" width={25} height={25} alt='' />Status</Link>
          <Link  className={`menu-list-item ${pathname === '/update' ? 'opt-active' : ''}`} href="/update"><Image src="/assets/icons/update.png" className="menu-list-icon" width={25} height={25} alt='' />Update</Link>
          </>
          )}
          {(currUser === 'HOD' || currUser === 'admin') && (
            <>
            <Link className={`menu-list-item ${pathname === '/approve' ? 'opt-active' : ''}`}  href="/approve"><Image src="/assets/icons/approve.png" className="menu-list-icon" width={25} height={25} alt='' />Approve</Link>
            <Link className={`menu-list-item ${pathname === '/report' ? 'opt-active' : ''}`} href="/report"><Image src="/assets/icons/report.png" className="menu-list-icon" width={25} height={25} alt='' />Report</Link>
            </>
              )}
              {(currUser === 'admin') && (
                <>
                  <Link className={`menu-list-item ${pathname === '/venues' ? 'opt-active' : ''}`} href="/venues"><Image src="/assets/icons/venue.png" className="menu-list-icon" width={25} height={25} alt='' />Venue</Link>
                </>
              )}
          <Link className={`menu-list-item ${pathname === '/profile' ? 'opt-active' : ''}`} href="/profile" ><Image src="/assets/icons/profile.png" className="menu-list-icon" width={25} height={25} alt='' />Profile</Link>
          {(session?.user?.isSuperAdmin === 1) ? (<Link className={`menu-list-item ${pathname === '/manage' ? 'opt-active' : ''}`} href="/manage" ><Image src="/assets/icons/manage.png" className="menu-list-icon" width={25} height={25} alt='' />Manage</Link>):(<></>)}        </ul>
      </div>
        </>
      )
      }
    </div>
  );
};
