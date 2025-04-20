'use client';

import { Navbar } from '@/features/dashboard/components/navbar';

export const SearchCard = () => {
  return (
    <>
      <Navbar title='Search' showOptionsButton={true} showBackButton={true} />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full'></div>
      </div>
    </>
  );
};
