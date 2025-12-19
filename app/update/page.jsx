'use client';
import dynamic from 'next/dynamic';

// Dynamically import Update component with SSR disabled
const Update = dynamic(() => import('@/components/Update/update'), {
  ssr: false,
});

export default function UpdatePage() {
  return (
    <>
      <Update />
    </>
  );
}
