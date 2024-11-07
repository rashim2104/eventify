import logo from '@/public/assets/images/logo.png';
import Image from 'next/image';
export default function ForgotPassword() {
  return (
    <div className='flex flex-col w-1/2'>
      <Image src={logo} width={300} height={300} alt="Eventify Logo" className='mb-3' />
      <h1 className="text-2xl">Oops! It looks like you&apos;ve forgotten your password.</h1>
      <p>Don&apos;t worry, we&apos;re here to help!</p>
      <p>Please reach out to your administrator for assistance or send us an email at <a href="mailto:eventify@gmail.com">eventify@gmail.com</a>, and we&apos;ll get you back on track in no time.</p>
      <p>Thank you for choosing!</p>
    </div>
  );
}
