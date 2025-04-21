'use client'

import { Navbar } from '@/features/dashboard/components/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import useUser from '../hook/useUser';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ChartNoAxesCombined, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from './create-post-modal';
import useCurrentUser from '../hook/useCurrentUser';
import { FeedCardProfile } from './feed-card-profile';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import EditProfileCard from './edit-profile-card';

export const UserProfileCard = () => {
  const params = useParams();
  const userProfile = useUser(params.username as string);
  const { currentUser } = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [followersCounts, setFollowersCounts] = useState<number>(0);
  const router = useRouter();
  const [isFollowed, setIsFollowed] = useState<boolean>(() => {
    if (!userProfile.user?._id || !currentUser?._id) return false;
    return (
      userProfile.user.followers.includes(currentUser._id) &&
      currentUser.followings.includes(userProfile.user._id)
    );
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/username/${params.username}`);
      setFollowersCounts(res.data.followers.length);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [params.username]);

  useEffect(() => {
    fetchUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFollowed])
  
  useEffect(() => {
    if (!userProfile.user?._id || !currentUser?._id) return;
    setIsFollowed(
      userProfile.user.followers.includes(currentUser._id) &&
      currentUser.followings.includes(userProfile.user._id)
    );
  }, [userProfile.user, currentUser]);
  
  const toggleFollow = () => {
    if (userProfile.user?._id === currentUser?._id) return;
    
    startTransition(async () => {
      try {
        if (isFollowed) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/unFollow/${userProfile?.user?._id}`
          );
          setFollowersCounts((prev) => prev - 1);
          setIsFollowed(false);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/follow/${userProfile?.user?._id}`
          );
          setFollowersCounts((prev) => prev + 1);
          setIsFollowed(true);
        }
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    })
  }

  const handleMessageClick = () => {
    router.push(`/messages/${userProfile.user?._id}`);
  }

  if (userProfile.error) {
    notFound();
  }

  return (
    <>
      <Navbar
        title={
          (userProfile.user?._id === currentUser?._id
            ? 'Your Profile'
            : userProfile.user?.username) || ''
        }
        showOptionsButton={true}
        showBackButton={true}
      />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full w-full'>
          <div className='flex flex-col items-center h-full w-full pt-5 px-6 pb-3'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col '>
                <h1 className='text-2xl font-semibold text-white'>
                  {userProfile.user?.fullName}
                </h1>
                <p className='text-sm text-white'>
                  {userProfile.user?.username}
                </p>
              </div>
              <Avatar className='w-21 h-21 rounded-full overflow-hidden'>
                <AvatarImage
                  src={userProfile.user?.avatar}
                  alt={userProfile.user?.username}
                  className='object-cover'
                />
                <AvatarFallback>
                  {userProfile.user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {userProfile.user?.shortDescription && (
              <p className='text-sm text-white w-full mt-4'>
                {userProfile.user?.shortDescription}
              </p>
            )}
            <div className='flex items-center justify-between w-full h-9 mt-3'>
              <p className='text-sm text-neutral-400'>
                {followersCounts} followers
              </p>
              <div className='flex flex-row gap-x-3'>
                <ChartNoAxesCombined
                  size={24}
                  className='text-white cursor-pointer'
                />
                <Instagram size={24} className='text-white cursor-pointer' />
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between gap-x-3 w-full px-6 py-3'>
            {userProfile.user?._id === currentUser?._id ? (
              <EditProfileCard
                currentUser={currentUser}
                onProfileUpdated={fetchUserProfile}
              />
            ) : (
              <>
                <Button
                  variant='ghost'
                  onClick={toggleFollow}
                  disabled={isPending}
                  className={cn(
                    'font-semibold rounded-lg flex-1 border border-neutral-800',
                    isFollowed
                      ? 'text-white'
                      : 'bg-red-800 text-white hover:bg-red-900'
                  )}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </Button>
                <Button
                  onClick={handleMessageClick}
                  variant='ghost'
                  className='text-white font-semibold rounded-lg flex-1 border border-neutral-800'
                >
                  Message
                </Button>
              </>
            )}
          </div>
          <div className='flex items-center justify-around w-full h-[49px]'>
            <div className='flex items-center justify-center border-b-[1px] border-white h-full w-full'>
              <p className='text-sm text-white font-semibold'>Thread</p>
            </div>
            <div className='flex items-center justify-center border-b-[1px] border-neutral-600 h-full w-full'>
              <p className='text-sm text-neutral-600 font-semibold'>Replies</p>
            </div>
          </div>
          {userProfile.user?._id === currentUser?._id && (
            <CreatePostModal currentUser={userProfile.user} />
          )}
          <FeedCardProfile
            currentUser={currentUser}
            userProfile={userProfile}
          />
        </div>
      </div>
    </>
  );
};
