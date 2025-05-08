/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Navbar } from '@/features/dashboard/components/navbar';
import useCurrentUser from '@/features/dashboard/hook/useCurrentUser';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotificationSocket } from '../hooks/useNotiSocket';
import { Notification } from '@/features/types';
import axiosInstance from '@/lib/axios';
import { NotificationLabel } from './notification-label';

export const NotificationCard = () => {
  const token = parseCookies().token;
  const { currentUser } = useCurrentUser();
  const observerRef = useRef<HTMLDivElement | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleIncomingNotification = useCallback((notification: Notification) => {
    console.log('🔔 New notification from socket:', notification);
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  useNotificationSocket({
    token,
    currentUserId,
    onNotification: handleIncomingNotification,
  });

  const fetchNotifications = useCallback(async (page: number) => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications?page=${page}&limit=10`
      );
      return res.data || [];
    } catch (error) {
      console.log(error)
    }
  }, [])

  const loadOlderNotifications = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const olderNotifications = await fetchNotifications(page);
    if (olderNotifications.length === 0) {
      setHasMore(false);
    } else {
      setNotifications((prev) => [ ...prev, ...olderNotifications]);
      setPage((prev) => prev + 1);
    }

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 0);
  }

  useEffect(() => {
    loadOlderNotifications();
  }, []);

  useEffect(() => {
    setCurrentUserId(currentUser?._id || null);
  }, [currentUser]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadOlderNotifications();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore]); 

  return (
    <>
      <Navbar
        title='Notifications'
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full pt-6'>
          {notifications.map((notification) => (
            <NotificationLabel
              key={notification._id}
              notification={notification}
            />
          ))}
          {notifications.length === 0 && (
            <div className='flex flex-col items-center justify-center h-full'>
              <p className='text-muted-foreground'>No notifications!</p>
            </div>
          )}
          {notifications.length > 0 && (
            <div ref={observerRef} className='h-1'></div>
          )}
        </div>
      </div>
    </>
  );
};
