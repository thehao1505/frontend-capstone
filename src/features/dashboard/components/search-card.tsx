'use client';

import { Navbar } from '@/features/dashboard/components/navbar';

export const SearchCard = () => {
  return (
    <>
      <Navbar title='Search' showOptionsButton={true} showBackButton={true} />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full'>
          <div className='w-full mx-auto px-6 pt-6 pb-4 border-b border-neutral-800'>
            <input
              type='text'
              placeholder='Search'
              className='w-full p-2 px-10 border rounded-xl border-neutral-700 bg-neutral-950 text-white'
              // value={query}
              // onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};
