'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Navbar } from '../../dashboard/components/navbar';
import { useSocket } from '../hooks/useSocket';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import { parseCookies } from 'nookies';
import useCurrentUser from '../../dashboard/hook/useCurrentUser';

type MessageType = {
  sender: {
    _id: string;
  };
  content: string;
};

export const MessageCard = () => {
  const token = parseCookies().token;
  const { currentUser } = useCurrentUser()
  const { connectionId } = useParams();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [content, setContent] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleIncomingMessage = useCallback((msg: MessageType) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const socketRef = useSocket({
    token,
    currentUserId,
    onMessage: handleIncomingMessage,
  });

  useEffect(() => {
    setCurrentUserId(currentUser?._id || null)
  }, [currentUser])

  const fetchMessages = async (
    page: number,
    limit: number
  ) => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/message/conversation?connectionId=${connectionId}&page=${page}&limit=${limit}`
      );
      return res.data || [];
    } catch (error) {
      console.log(error)
    }
  };

  const loadOlderMessages = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const container = containerRef.current;
    const previousHeight = container?.scrollHeight ?? 0;

    const older = await fetchMessages(page, 10);
    if (older.length === 0) {
      setHasMore(false);
    } else {
      setMessages((prev) => [...older, ...prev]);
      setPage((prev) => prev + 1);
    }

    setTimeout(() => {
      const newHeight = container?.scrollHeight ?? 0;
      if (container) container.scrollTop = newHeight - previousHeight;
      setIsLoadingMore(false);
    }, 0);
  };

  const handleSend = () => {
    if (!content.trim()) return;
    const newMsg = { sender: { _id: currentUserId || '' }, content };
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        receiverId: connectionId,
        content,
      });
      setContent('');
    }
    setMessages((prev) => [...prev, newMsg]);
    setContent('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadOlderMessages();
  }, []);

  useEffect(() => {
    if (!topObserverRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topEntry = entries[0];
        if (topEntry.isIntersecting && hasMore && !isLoadingMore) {
          loadOlderMessages();
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(topObserverRef.current);

    return () => {
      if (topObserverRef.current) observer.unobserve(topObserverRef.current);
    };
  }, [hasMore, isLoadingMore]);

  return (
    <>
      <Navbar title='Messages' showOptionsButton={true} showBackButton={true} />
      <div
        className='w-full bg-neutral-900 border-t border-neutral-800 rounded-3xl h-[100vh-60px]'
        style={{ height: `calc(100vh - 60px)` }}
      >
        <div className='flex flex-col h-full'>
          <div
            ref={containerRef}
            className='flex-1 overflow-y-auto p-4 space-y-2'
          >
            <div ref={topObserverRef} />
            {isLoadingMore && (
              <p className='text-center text-neutral-400 text-sm'>
                Loading more...
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-3xl max-w-[70%] ${
                    msg.sender._id === currentUserId
                      ? 'bg-red-800 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className='p-4 border-t border-neutral-700 bg-neutral-900 sticky bottom-0 w-full flex items-center'>
            <TextareaAutosize
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Type a message...'
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              minRows={1}
              maxRows={20}
              className='flex-1 px-3 rounded-2xl resize-none border border-neutral-700 focus:outline-none focus:ring-0 p-2 mr-3 text-white placeholder:text-muted-foreground'
            />
            <button
              onClick={handleSend}
              className='bg-red-800 text-white px-4 py-2 rounded-2xl'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
