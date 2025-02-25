'use client';
import dynamic from 'next/dynamic';

// Dynamically import CreateForm with SSR disabled
const CreateForm = dynamic(() => import('@/components/CreateForm/createform'), {
  ssr: false
});

export default function Create() {
  return (
    <>
      <CreateForm />
    </>
  );
}
