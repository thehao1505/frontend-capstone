/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import axiosInstance from '@/lib/axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PostCard } from './post-card';
import { Post, User } from '@/features/types';

interface FeedCardProfileProps {
  currentUser: User | null;
  userProfile: {
    user: User | null;
    loadingUser: boolean;
    error: string | null;
  };
}

export const FeedCardProfile = ({
  currentUser,
  userProfile,
}: FeedCardProfileProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);
  const { user, loadingUser } = userProfile;
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const authorParams = user?._id ? `&author=${user._id}` : '';
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?page=${page}&limit=2${authorParams}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post._id));
          const newPosts = response.data.filter(
            (post: Post) => !existingIds.has(post._id)
          );
          return [...prev, ...newPosts];
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    if (!loadingUser && hasMore) {
      fetchPosts();
    }
  }, [page, loadingUser, hasMore]);

  useEffect(() => {
    if (!user?._id && !initialLoadDone && posts.length > 0) {
      setInitialLoadDone(true);
    } else if (user?._id && !initialLoadDone) {
      setInitialLoadDone(true);
    }
  }, [posts, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading && initialLoadDone) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading, initialLoadDone]);

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          {...post}
          currentUser={currentUser?._id || null}
        />
      ))}
      {hasMore && (
        <div ref={loader}>
          <span className='text-sm animate-pulse'>Loading...</span>
        </div>
      )}
    </>
  );
};
