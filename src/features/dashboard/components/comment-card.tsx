'use client';

import { Comment } from "@/features/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Heart, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from "clsx";
import { useState, useTransition } from "react";
import CommentChildButton from "./comment-child-card";
import { useRouter } from 'next/navigation';
 
import axiosInstance from "@/lib/axios";

export const CommentCard = ({ comment, currentUser }: { comment: Comment, currentUser: string | null}) => {
  const [liked, setLiked] = useState(comment.likes.includes(currentUser || ''));
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const toggleLike = () => {
    if (!currentUser) return;

    startTransition(async () => {
      try {
        if (liked) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment/${comment._id}/unLike`
          );
          setLikeCount((prev) => prev - 1);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment/${comment._id}/like`
          );
          setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    });
  };

  const handleAuthorClick = () => {
    router.push(`/${comment?.userId?.username}`);
  };

  return (
    <div>
      <div className='flex flex-row items-start gap-3 w-full px-6 py-3 border-b-[1px] border-neutral-800'>
        <Avatar className='w-9 h-9 rounded-full overflow-hidden'>
          <AvatarImage
            src={comment?.userId?.avatar}
            alt={comment?.userId?.username}
            className='object-cover'
          />
          <AvatarFallback>
            {comment.userId.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 flex flex-col'>
          <div className='flex items-center text-sm gap-1 font-medium text-white'>
            <span
              onClick={() => handleAuthorClick()}
              className='cursor-pointer hover:underline'
            >
              {comment.userId.username}
            </span>
            <span className='text-xs text-muted-foreground'>• </span>
            <span className='text-xs text-muted-foreground cursor-pointer hover:underline'>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-sm text-white whitespace-pre-line'>
              {comment?.content}
            </p>
          </div>
          <div className='flex items-center gap-6 text-muted-foreground text-sm pt-2'>
            <button
              onClick={toggleLike}
              disabled={isPending || !currentUser}
              className={clsx(
                'flex items-center gap-1 transition-colors duration-150',
                liked
                  ? 'text-red-500 hover:fill-red-400'
                  : 'hover:text-neutral-400'
              )}
            >
              <Heart className={clsx('w-4 h-4', liked && 'fill-red-500')} />
              {likeCount}
            </button>
            <CommentChildButton
              postId={comment.postId}
              currentUser={currentUser}
              parentId={comment._id}
            />
            <button className='flex items-center gap-1 hover:text-neutral-400'>
              <Send className='w-4 h-4' />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}