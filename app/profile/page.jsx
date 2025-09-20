'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Profile() {
  const { data: session, status, update: updateSession } = useSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const validatePassword = password => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const checkPasswordStrength = password => {
    const newRequirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    setRequirements(newRequirements);
    const strength = Object.values(newRequirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  useEffect(() => {
    checkPasswordStrength(newPassword);
  }, [newPassword]);

  useEffect(() => {
    if (session?.user?.hasDefaultPassword) {
      toast.warning(
        'Please change your default password to continue using the application',
        {
          duration: 5000,
        }
      );
    }
  }, [session]);

  const handleChangePassword = async () => {
    const email = session?.user?.email;
    setSubmitting(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      setSubmitting(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
      );
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/changePwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
          action: 'user',
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Password Changed') {
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Only update session if user had default password
        if (session?.user?.hasDefaultPassword === true) {
          await updateSession({
            hasDefaultPassword: false,
          });
        }
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
    }

    setSubmitting(false);
  };

  if (status === 'loading') {
    return (
      <div className='grid place-items-center h-screen text-xl font-extrabold'>
        Loading...
      </div>
    );
  }

  return (
    <div className='p-6'>
      {session?.user?.hasDefaultPassword && (
        <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6'>
          <p className='font-bold'>Warning!</p>
          <p>
            You are using the default password. Please change it before
            continuing.
          </p>
        </div>
      )}
      <p className='text-4xl font-bold'> Hello, {session?.user?.name}</p>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='bg-gray-200 flex flex-col md:w-1/2 mt-5 p-12 rounded-xl'>
          <p className='font-bold text-3xl mb-4'>Profile</p>

          <label className='text-lg font-bold mb-1'>Name</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.name}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>Email</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.email}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>College</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.college}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>Department</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.dept}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>Role</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.role}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>Phone Number</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.phone}
            readOnly
          />
          <br />

          <label className='text-lg font-bold mb-1'>Staff ID</label>
          <input
            className='p-2 rounded w-full'
            type='text'
            value={session.user.id}
            readOnly
          />
        </div>
        <div className='bg-gray-200 flex flex-col md:w-1/2 mt-5 p-12 rounded-xl'>
          <p className='text-3xl font-bold mb-4'>Change Password</p>
          <label className='text-lg font-bold mb-1'>Old Password</label>
          <input
            className='p-2 rounded w-full'
            type='password'
            placeholder='Enter old password'
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
          <br />
          <label className='text-lg font-bold mb-1'>New Password</label>
          <input
            className='p-2 rounded w-full'
            type='password'
            placeholder='Enter new password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <br />
          {newPassword.length > 0 && (
            <div className='mb-4'>
              <div className='flex justify-between mb-1'>
                <span className='text-sm'>Password Strength:</span>
                <span className='text-sm'>
                  {passwordStrength === 5
                    ? 'Strong'
                    : passwordStrength >= 3
                      ? 'Medium'
                      : 'Weak'}
                </span>
              </div>
              <div className='w-full h-2 bg-gray-300 rounded-full'>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    passwordStrength === 5
                      ? 'bg-green-500 w-full'
                      : passwordStrength >= 3
                        ? 'bg-yellow-500 w-3/5'
                        : 'bg-red-500 w-1/5'
                  }`}
                ></div>
              </div>
              <ul className='mt-2 text-sm space-y-1'>
                <li
                  className={
                    requirements.length ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  ✓ At least 8 characters
                </li>
                <li
                  className={
                    requirements.lowercase ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  ✓ One lowercase letter
                </li>
                <li
                  className={
                    requirements.uppercase ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  ✓ One uppercase letter
                </li>
                <li
                  className={
                    requirements.number ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  ✓ One number
                </li>
                <li
                  className={
                    requirements.special ? 'text-green-600' : 'text-gray-600'
                  }
                >
                  ✓ One special character
                </li>
              </ul>
            </div>
          )}
          <label className='text-lg font-bold mb-1'>Confirm New Password</label>
          <input
            className='p-2 rounded w-full'
            type='password'
            placeholder='Confirm new password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <br />
          <button
            className='w-full bg-orange-400 hover:bg-orange-500 text-white font-bold p-2 rounded-3xl mt-3'
            onClick={handleChangePassword}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
