'use client';

import { MessageCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import Modal from '@/components/modal';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { formatDistanceToNow } from 'date-fns';

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: User;
  createdAt: string;
  updatedAt: string;
}

export default function CommentButton({ postId, currentUser }: { postId: string | null, currentUser: string | null }) {
  const [showPopup, setShowPopup] = useState(false);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string>('');
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment?postId=${postId}`
      );
      setComments(res.data);
      
      const dates: Record<string, string> = {};
      res.data.forEach((comment: Comment) => {
        dates[comment._id] = formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
        });
      });
      setFormattedDates(dates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      if (content.length === 0) {
        setError('Please enter some content');
        return;
      }
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comment`,
        {
          postId,
          content,
          userId: currentUser,
        }
      );
      setContent('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        className='flex items-center gap-1 hover:text-neutral-400'
        onClick={() => setShowPopup(true)}
      >
        <MessageCircle className='w-4 h-4' />
        <span>{comments.length}</span>
      </button>

      {showPopup && (
        <Modal
          title='New Comment Reply'
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        >
          <div className='space-y-2 max-h-64 overflow-y-auto mb-4'>
            {!!error && (
              <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
                <TriangleAlert className='size-4' />
                <p>Please don&apos;t leave the comment empty</p>
              </div>
            )}
            {comments.map((c) => (
              <div key={c._id} className='text-sm text-neutral-200'>
                <div className='flex flex-row items-start gap-3 w-full'>
                  <Avatar className='w-9 h-9 rounded-full overflow-hidden'>
                    <AvatarImage
                      src={c.userId.avatar}
                      alt={c.userId.username}
                      className='object-cover'
                    />
                    <AvatarFallback>
                      {c.userId.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 flex flex-col'>
                    <div className='flex items-center text-sm gap-1 font-medium text-white'>
                      <span>{c.userId.username}</span>
                      <span className='text-xs text-muted-foreground'>
                        • {formattedDates[c._id] || ''}
                      </span>
                    </div>
                    <p>{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex gap-2'>
            <input
              type='text'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='flex-1 bg-neutral-800 text-white p-2 rounded border border-neutral-800'
              placeholder='Write comment here...'
            />
            <button
              onClick={handleSubmit}
              className='bg-primary text-white px-4 rounded hover:bg-primary/90'
            >
              Send
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
