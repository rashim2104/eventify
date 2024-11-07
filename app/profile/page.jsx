"use client"
import { useSession } from 'next-auth/react'
import { useState } from 'react';
import { toast } from "sonner";

export default function Profile() {
  const { data: session, status } =  useSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false); // Add state for submitting

  const handleChangePassword = async () => {
    var email = session?.user?.email;
    setSubmitting(true); // Set submitting state to true
    if (!oldPassword || !newPassword) {
      toast.error("Please enter the old and new password.");
      setSubmitting(false);
      return;
    }
    const response = await fetch('/api/changePwd', {
      method: 'POST',
      body: JSON.stringify({ action: 'user',email, oldPassword, newPassword }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if(data.message === "Password Changed"){
        toast.success("Password changed successfully");
      }else{
        toast.error(data.message)
      }
      setOldPassword('');
      setNewPassword('');
    } else {
      toast.error("Error changing password");
    }
    setSubmitting(false); // Set submitting state to false after response
  };

  if (status === "loading") {
    return <div className="grid place-items-center h-screen text-xl font-extrabold">Loading...</div>;
  }

  return (
    <div>
      <p className='text-4xl font-bold'> Hello, {session?.user?.name}</p>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='bg-gray-200 flex flex-col md:w-1/2 mt-5 p-12 rounded-xl'>
          <p className='font-bold text-3xl mb-4'>Profile</p>
          <label className='text-lg font-bold mb-1'>Name</label>
          <input className="p-2 rounded w-full" type='text' value={session.user.name} readOnly/><br/>
          <label className='text-lg font-bold mb-1'>Email</label>
          <input className="p-2 rounded w-full" type='text' value={session.user.email} readOnly/><br/>
          <label className='text-lg font-bold mb-1'>College</label>
          <input className="p-2 rounded w-full" type='text' value={session.user.college} readOnly/><br/>
          <label className='text-lg font-bold mb-1'>Department</label>
          <input className="p-2 rounded w-full" type='text' value={session.user.dept} readOnly/><br/>
          <label className='text-lg font-bold mb-1'>Role</label>
          <input className="p-2 rounded w-full" type='text' value={session.user.role} readOnly/>
        </div>
        <div className='bg-gray-200 flex flex-col md:w-1/2 mt-5 p-12 rounded-xl'>
          <p className='text-3xl font-bold mb-4'>Change Password</p>
          <label className='text-lg font-bold mb-1'>Old Password</label>
          <input className="p-2 rounded w-full" type='password' placeholder='Enter old password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/><br/>
          <label className='text-lg font-bold mb-1'>New Password</label>
          <input className="p-2 rounded w-full" type='password' placeholder='Enter new password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/><br/>
          <button className='w-full bg-orange-400 hover:bg-orange-500 text-white font-bold p-2 rounded-3xl mt-3' onClick={handleChangePassword} disabled={submitting}>{submitting ? 'Submitting...' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  )
}
