import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Notification } from '@/features/types';
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { Heart } from "lucide-react";
import CommentButton from "@/features/dashboard/components/comment-modal";
import ShareButton from "@/features/dashboard/components/share-button";
import useCurrentUser from "@/features/dashboard/hook/useCurrentUser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";

export const NotificationLabel = ({
  notification,
}: {
  notification: Notification;
}) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const [liked, setLiked] = useState(
    notification.postId?.likes.includes(currentUser?._id || '') ||
    notification.commentId?.likes.includes(currentUser?._id || '')
  );
  const [likeCount, setLikeCount] = useState<number>(0);
  const [formattedDate, setFormattedDate] = useState('');
  const [isFollowed, setIsFollowed] = useState<boolean>(() => {
    if (!notification.senderId?._id || !currentUser?._id) return false;
    return (
      notification.senderId.followers.includes(currentUser._id) &&
      currentUser.followings.includes(notification.senderId._id)
    );
  });

  useEffect(() => {
    setLiked(
      notification.postId?.likes.includes(currentUser?._id || '') ||
      notification.commentId?.likes.includes(currentUser?._id || '')
    );
    setLikeCount(
      notification.postId?.likes.length || 
      notification.commentId?.likes.length || 
      0
    );
  }, [currentUser, notification]);

  useEffect(() => {
    setFormattedDate(
      formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: false,
      })
    );
  }, [notification.createdAt]);

  useEffect(() => {
    if (!notification.senderId?._id || !currentUser?._id) return;
    setIsFollowed(
      notification.senderId.followers.includes(currentUser._id) &&
      currentUser.followings.includes(notification.senderId._id)
    );
  }, [notification.senderId, currentUser]);

  const toggleFollow = () => {
    if (notification.senderId?._id === currentUser?._id) return;

    startTransition(async () => {
      try {
        if (isFollowed) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/unFollow/${notification.senderId?._id}`
          );
          setIsFollowed(false);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/follow/${notification.senderId?._id}`
          );
          setIsFollowed(true);
        }
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    });
  };

  const handleNotificationClick = () => {
    switch (notification.type) {
      case 'FOLLOW':
        router.push(`/${notification.senderId.username}`);
        break;
      case 'LIKE':
        router.push(`/${notification.senderId.username}/post/${notification.postId?._id}`);
        break;
      case 'COMMENT':
        router.push(`/${notification.senderId.username}/post/${notification.commentId?.postId}`);
        break;
      case 'COMMENT_REPLY':
        router.push(`/${notification.senderId.username}/post/${notification.commentId?.postId}`);
        break;
    }
  }

  const handleAuthorClick = () => {
    router.push(`/${notification.senderId.username}`);
  };

  return (
    <div key={notification._id}>
      <div className='flex flex-row h-full gap-3 pb-3 pl-6'>
        <Avatar className='w-9 h-9 rounded-full items-start overflow-hidden'>
          <AvatarImage
            src={notification.senderId.avatar}
            alt={notification.senderId.username}
            className='object-cover'
          />
          <AvatarFallback>
            {notification.senderId.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 flex flex-col'>
          <div className='flex items-center text-sm gap-1 font-medium text-white'>
            <span
              onClick={() => handleAuthorClick()}
              className='cursor-pointer hover:underline'
            >
              {notification.senderId.username}
            </span>
            <span> </span>
            <span className='text-sm text-muted-foreground'>
              {formattedDate}
            </span>
          </div>
          <div 
            onClick={handleNotificationClick}
            className='flex flex-col gap-1 cursor-pointer'
          >
            {notification.type === 'LIKE' && (
              <div className='flex flex-col items-center gap-1'>
                <p className='text-sm text-muted-foreground w-full whitespace-pre-line'>
                  Liked your post
                </p>
                <p className='text-sm text-white whitespace-pre-line pr-10'>
                  {notification.postId?.content}
                </p>
                <div className='flex items-center gap-6 text-muted-foreground text-sm pt-1 w-full'>
                  <button
                    className={clsx(
                      'flex items-center gap-1 transition-colors duration-150',
                      liked
                        ? 'text-red-500 hover:fill-red-400'
                        : 'hover:text-neutral-400'
                    )}
                  >
                    <Heart
                      className={clsx('w-4 h-4', liked && 'fill-red-500')}
                    />
                    <span>{likeCount}</span>
                  </button>
                  <CommentButton
                    postId={notification.postId?._id || null}
                    currentUser={currentUser?._id || null}
                  />
                  <ShareButton />
                </div>
              </div>
            )}
            {notification.type === 'FOLLOW' && (
              <p className='text-sm text-muted-foreground w-full whitespace-pre-line'>
                Followed you
              </p>
            )}
            {notification.type === 'COMMENT' && (
              <div>
                <p className='text-sm text-muted-foreground w-full whitespace-pre-line'>
                  Commented on your post
                </p>
                <p className='text-sm text-white whitespace-pre-line pr-10'>
                  {notification.commentId?.content}
                </p>
                <div className='flex items-center gap-6 text-muted-foreground text-sm pt-1 w-full'>
                  <button
                    className={clsx(
                      'flex items-center gap-1 transition-colors duration-150',
                      liked
                        ? 'text-red-500 hover:fill-red-400'
                        : 'hover:text-neutral-400'
                    )}
                  >
                    <Heart
                      className={clsx('w-4 h-4', liked && 'fill-red-500')}
                    />
                    <span>{likeCount}</span>
                  </button>
                  <CommentButton
                    postId={notification.postId?._id || null}
                    currentUser={currentUser?._id || null}
                  />
                  <ShareButton />
                </div>
              </div>
            )}
            {notification.type === 'COMMENT_REPLY' && (
              <div>
                <p className='text-sm text-muted-foreground w-full whitespace-pre-line'>
                  Replied to your comment
                </p>
                <p className='text-sm text-white whitespace-pre-line pr-10'>
                  {notification.commentId?.content}
                </p>
                <div className='flex items-center gap-6 text-muted-foreground text-sm pt-1 w-full'>
                  <button
                    className={clsx(
                      'flex items-center gap-1 transition-colors duration-150',
                      liked
                        ? 'text-red-500 hover:fill-red-400'
                        : 'hover:text-neutral-400'
                    )}
                  >
                    <Heart
                      className={clsx('w-4 h-4', liked && 'fill-red-500')}
                    />
                    <span>{likeCount}</span>
                  </button>
                  <CommentButton
                    postId={notification.postId?._id || null}
                    currentUser={currentUser?._id || null}
                  />
                  <ShareButton />
                </div>
              </div>
            )}
          </div>
        </div>
        {notification.type === 'FOLLOW' && (
          <div className='flex flex-col pr-6 items-center'>
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
              {isFollowed ? 'Following' : 'Follow Back'}
            </Button>
          </div>
        )}
      </div>
      <div className='relative h-[1px] w-full pb-3'>
        <div className='absolute left-18 right-0 top-0 h-px bg-white/30' />
      </div>
    </div>
  );
};