'use client'

import axiosInstance from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Heart, Send } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import CommentButton from "./comment-modal";
import { useRouter } from 'next/navigation';

interface Author {
  _id: string;
  username: string;
  avatar: string;
}

interface Post {
  _id: string;
  content: string;
  images: string[];
  author: Author;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps extends Post {
  currentUser: string | null;
}

export const PostCard = ({ currentUser, ...post }: PostCardProps) => {
  const [liked, setLiked] = useState(post.likes.includes(currentUser || ''));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isPending, startTransition] = useTransition();
  const [formattedDate, setFormattedDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLiked(post.likes.includes(currentUser || ''));
  }, [liked, currentUser, post])

  useEffect(() => {
    setFormattedDate(formatDistanceToNow(new Date(post.createdAt), {
      addSuffix: true,
    }));
  }, [post.createdAt]);

  const toggleLike = () => {
    if (!currentUser) return;

    startTransition(async () => {
      try {
        if (liked) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${post._id}/unLike`
          );
          setLikeCount((prev) => prev - 1);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${post._id}/like`
          );
          setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    });
  };

  const handlePostClick = () => {
    router.push(`/${post.author.username}/post/${post._id}`)
  }

  const handleAuthorClick = () => {
    router.push(`/${post.author.username}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex flex-row items-start gap-3 w-full px-6 py-3 border-b-[1px] border-neutral-800'>
        <Avatar className='w-9 h-9 rounded-full overflow-hidden'>
          <AvatarImage
            src={post.author.avatar}
            alt={post.author.username}
            className='object-cover'
          />
          <AvatarFallback>
            {post.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 flex flex-col'>
          <div className='flex items-center text-sm gap-1 font-medium text-white'>
            <span
              onClick={() => handleAuthorClick()}
              className='cursor-pointer hover:underline'
            >
              {post.author.username}
            </span>
            <span className='text-xs text-muted-foreground'>• </span>
            <span
              onClick={() => handlePostClick()}
              className='text-xs text-muted-foreground cursor-pointer hover:underline'
            >
              {formattedDate}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-sm text-white whitespace-pre-line'>
              {post.content}
            </p>

            {post.images.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {post.images.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className='rounded-md object-cover max-h-60 flex-1 basis-[48%]'
                  />
                ))}
              </div>
            )}

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
                <span>{likeCount}</span>
              </button>
              <CommentButton postId={post._id} currentUser={currentUser} />
              <button className='flex items-center gap-1 hover:text-neutral-400'>
                <Send className='w-4 h-4' />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
