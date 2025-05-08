import { Button } from "@/components/ui/button";
import { User } from "@/features/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import clsx from "clsx";
import { startTransition, useState } from "react";
import useCurrentUser from "../hook/useCurrentUser";
import axiosInstance from "@/lib/axios";

export const SearchUserCard = ({ user }: { user: User }) => {
  const { currentUser } = useCurrentUser();
  const [isFollowed, setIsFollowed] = useState<boolean>(() => {
    if (!user?._id || !currentUser?._id) return false;
    return (
      user.followers.includes(currentUser._id) &&
      currentUser.followings.includes(user._id)
    );
  });

  const toggleFollow = () => {
    if (user?._id === currentUser?._id) return;

    startTransition(async () => {
      try {
        if (isFollowed) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/unFollow/${user?._id}`
          );
          setIsFollowed(false);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/follow/${user?._id}`
          );
          setIsFollowed(true);
        }
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    });
  };

  return (
    <>
      <div className='flex flex-row px-6 py-3 h-full items-center justify-between'>
        <div className='flex flex-row items-center'>
          <Avatar className='w-9 h-9 mr-3 rounded-full items-center overflow-hidden'>
            <AvatarImage
              src={user.avatar}
              alt={user.username}
              className='object-cover'
            />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col text-[15px] gap-1 text-white'>
            <span className='font-semibold cursor-pointer hover:underline'>
              {user.username}
            </span>
            <span className='text-muted-foreground font-medium'>
              {user.fullName}
            </span>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <Button
            variant='ghost'
            onClick={toggleFollow}
            className={clsx(
              'text-[14px] rounded-xl border border-neutral-800 font-medium',
              isFollowed
                ? 'text-white'
                : 'bg-red-800 text-white hover:bg-red-900'
            )}
          >
            {isFollowed ? 'Following' : 'Follow Back'}
          </Button>
        </div>
      </div>
      <div className='relative h-[1px] w-full'>
        <div className='absolute left-18 right-0 top-0 h-px bg-white/30' />
      </div>
    </>
  );
}