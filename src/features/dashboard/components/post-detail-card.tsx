'use client';

import { Navbar } from '@/features/dashboard/components/navbar';
import { Comment, Post } from '@/features/types';
import axiosInstance from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Heart, MessageCircle } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import clsx from 'clsx';
import useCurrentUser from '../hook/useCurrentUser';
import { CommentCard } from './comment-card';
import ShareButton from './share-button';

export const PostDetailCard = () => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const [post, setPost] = useState<Post>();
  const { currentUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formattedDate, setFormattedDate] = useState('');

  if (!params.postId || params.postId === 'undefined') {
    notFound();
  }

  useEffect(() => {
    if (post?.createdAt) {
      setFormattedDate(formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: false,
      }));
    }
  }, [post?.createdAt]);

  const fetchPost = useCallback(async () => {
    if (!params.postId) return;

    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${params.postId}`
      );
      setPost(res.data);
      setLiked(res.data.likes.includes(currentUser?._id || ''));
      setLikeCount(res.data.likes.length)
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setIsLoading(false)
    }
  }, [params, currentUser])

  const fetchComment = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment?postId=${post?._id}` // &page=page&limit=10
      );

      setComment(res.data)
      setCommentCount(res.data.length)
    } catch (error) {
      console.error('Error fetching comment:', error)
    }
  }, [post])

  const toggleLike = () => {
    if (!currentUser) return;

    startTransition(async () => {
      try {
        if (liked) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${post?._id}/unLike`
          );
          setLikeCount((prev) => prev - 1);
        } else {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${post?._id}/like`
          );
          setLikeCount((prev) => prev + 1);
        }
        setLiked(!liked);
      } catch (err) {
        console.error('Toggle like failed:', err);
      }
    });
  };

  useEffect(() => {
    fetchPost();
    if (!isLoading) fetchComment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.postId, currentUser, isLoading])

  return (
    <>
      <Navbar title='Thread' showOptionsButton={true} showBackButton={true} />
      <div className='bg-neutral-900 border-[1px] border-neutral-800 min-h-screen w-full rounded-t-3xl'>
        <div className='flex flex-col h-full px-6 pt-6 text-sm text-white border-b border-neutral-800'>
          <div className='flex flex-row gap-3 w-full items-center'>
            <Avatar className='w-9 h-9 rounded-full overflow-hidden'>
              <AvatarImage
                src={post?.author.avatar}
                alt={post?.author.username}
                className='object-cover'
              />
              <AvatarFallback>
                {post?.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex items-center text-sm font-medium text-white'>
              <span>{post?.author.username}</span>
              <span className='text-xs pl-1 text-muted-foreground'>
                • {formattedDate}
              </span>
            </div>
          </div>
          <div className='flex flex-col'>
            <p className='text-sm text-white whitespace-pre-line py-2'>
              {post?.content}
            </p>

            {(post?.images?.length || 0) > 0 && (
              <div className='flex flex-wrap gap-2 py-2'>
                {post?.images.map((image, index) => (
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
            <div className='flex items-center gap-6 text-muted-foreground text-sm py-3 border-b border-neutral-800'>
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
              <button className='flex items-center gap-1 hover:text-neutral-400'>
                <MessageCircle className='w-4 h-4' />
                <span>{commentCount}</span>
              </button>
              <ShareButton />
            </div>
            <div className='flex flex-row items-center justify-between py-4'>
              <p className='text-sm text-white font-semibold'>Most related</p>
              <div className='flex flex-row items-center text-sm text-muted-foreground'>
                <p>See activity</p>
                <ChevronRight className='w-4 h-4 ml-1' />
              </div>
            </div>
          </div>
        </div>
        {comment.map((comment) => (
          <CommentCard
            key={comment._id}
            comment={comment}
            currentUser={currentUser?._id || null}
            postId={post?._id || ''}
          />
        ))}
      </div>
    </>
  );
};
