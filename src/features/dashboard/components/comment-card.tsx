'use client';

import { Comment } from "@/features/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Heart, MoreVertical, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from "clsx";
import { useState, useTransition } from "react";
import CommentChildButton from "./comment-child-card";
import { useRouter } from 'next/navigation';
import axiosInstance from "@/lib/axios";
import ShareButton from "./share-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CommentCard = ({ comment, currentUser, postId }: { comment: Comment, currentUser: string | null, postId: string}) => {
  const [liked, setLiked] = useState(comment.likes.includes(currentUser || ''));
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [error, setError] = useState(false);
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

  const handleEdit = async () => {
    try {
      if (editedContent.length === 0) {
        setError(true);
        return;
      } else {
        await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment/${comment._id}`,
          { content: editedContent }
        );
        setEditedContent(editedContent);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Edit comment failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment`,
        {
          data: {
            commentId: comment._id,
            postId: postId,
          },
        }
      );
      window.location.reload();
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
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
          <div className='flex items-center justify-between'>
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
            {currentUser === comment.userId._id && (
              <DropdownMenu>
                <DropdownMenuTrigger className='text-muted-foreground hover:text-white'>
                  <MoreVertical className='w-4 h-4' />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className='w-4 h-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className='text-red-500'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            {isEditing ? (
              <>
                {!!error && (
                  <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
                    <TriangleAlert className='size-4' />
                    <p>Please don&apos;t leave the content empty</p>
                  </div>
                )}
                <div className='flex flex-col gap-2'>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className='w-full bg-neutral-800 text-white p-2 rounded border border-neutral-700'
                    rows={3}
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleEdit}
                      className='bg-primary text-white px-4 py-1 rounded hover:bg-primary/90'
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(comment.content);
                      }}
                      className='bg-neutral-800 text-white px-4 py-1 rounded hover:bg-neutral-700'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className='text-sm text-white whitespace-pre-line'>
                {editedContent}
              </p>
            )}
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
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  );
}