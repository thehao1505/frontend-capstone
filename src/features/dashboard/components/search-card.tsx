/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Navbar } from '@/features/dashboard/components/navbar';
import { Post, User } from '@/features/types';
import axiosInstance from '@/lib/axios';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchUserCard } from './search-user-card';
import useCurrentUser from '../hook/useCurrentUser';
import { PostCard } from './post-card';

export const SearchCard = () => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { currentUser } = useCurrentUser();
  const [text, setText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'users'>('posts');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/v1/users/search/users?page=${page}&limit=10&text=${encodeURIComponent(
          text
        )}`
      );
      const newUsers = response.data;
      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u._id));
        const filtered = newUsers.filter((u: User) => !existingIds.has(u._id));
        return [...prev, ...filtered];
      });
      if (newUsers.length < 10) setHasMore(false);
    } catch (error) {
      console.log('Fetch user failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [text, page]);

  const fetchSearchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/v1/recommendations/search?page=${page}&limit=10&text=${encodeURIComponent(
          text
        )}`
      );
      const newPosts = response.data;
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const filtered = newPosts.filter((p: Post) => !existingIds.has(p._id));
        return [...prev, ...filtered];
      });
      if (newPosts.length < 5) setHasMore(false);
    } catch (error) {
      console.log('Fetch posts failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [text, page]);

  // Reset data when text or tab changes
  useEffect(() => {
    if (!submitted || !text) return;

    setUsers([]);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [selectedTab, text]);

  // Fetch on change of page
  useEffect(() => {
    if (!submitted || !text) return;

    if (selectedTab === 'users') {
      fetchSearchUsers();
    } else {
      fetchSearchPosts();
    }
  }, [submitted, page, selectedTab, text]);

  // Infinite scroll
  useEffect(() => {
    if (!submitted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, submitted]);

  return (
    <>
      <Navbar title='Search' showOptionsButton={true} showBackButton={true} />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full'>
          {!submitted ? (
            <div className='w-full mx-auto px-6 pt-6 pb-4 border-b border-neutral-800'>
              <input
                type='text'
                placeholder='Search'
                className='w-full p-2 px-10 border rounded-xl border-neutral-700 bg-neutral-950 text-white'
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    setUsers([]);
                    setPosts([]);
                    setHasMore(true);
                    setSubmitted(true);
                  }
                }}
              />
            </div>
          ) : (
            <>
              <div className='flex justify-around border-b border-neutral-800'>
                <button
                  className={clsx(
                    'p-3 w-full text-center',
                    selectedTab === 'posts'
                      ? 'border-b-2 border-white text-white font-semibold'
                      : 'text-neutral-400'
                  )}
                  onClick={() => setSelectedTab('posts')}
                >
                  Most Related
                </button>
                <button
                  className={clsx(
                    'p-3 w-full text-center',
                    selectedTab === 'users'
                      ? 'border-b-2 border-white text-white font-semibold'
                      : 'text-neutral-400'
                  )}
                  onClick={() => setSelectedTab('users')}
                >
                  Users
                </button>
              </div>
              <div>
                {selectedTab === 'posts' &&
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      currentUser={currentUser?._id || null}
                      {...post}
                    />
                  ))}

                {selectedTab === 'users' &&
                  users.map((user) => (
                    <SearchUserCard key={user._id} user={user} />
                  ))}

                {isLoading && (
                  <p className='text-center text-neutral-400'>Loading...</p>
                )}

                {!isLoading &&
                  !hasMore &&
                  (selectedTab === 'users'
                    ? users.length === 0
                    : posts.length === 0) && (
                    <p className='text-center text-neutral-400'>
                      No results found.
                    </p>
                  )}

                <div ref={loaderRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
