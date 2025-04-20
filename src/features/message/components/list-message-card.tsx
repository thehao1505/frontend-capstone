'use client'

import { Navbar } from '@/features/dashboard/components/navbar';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { User } from '../../types';
import { UserCard } from './user-card';

export const ListMessageCard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connections, setConnections] = useState<User[]>([])
  const fetchConnection = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/connection/user`
      );
      setConnections(res.data)
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnection()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Navbar title='Messages' showOptionsButton={true} showBackButton={true} />
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
          {isLoading && (<p className='text-sm text-white'>Loading</p>)}
          {connections.map((connection) => (
            <UserCard key={connection._id} connection={connection}/>
          ))}
        </div>
      </div>
    </>
  );
};
