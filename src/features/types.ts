export interface Author {
  _id: string;
  username: string;
  avatar: string;
}

export interface Post {
  _id: string;
  content: string;
  images: string[];
  author: Author;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string | null;
  username: string;
  fullName?: string;
  shortDescription?: string;
  email: string;
  avatar: string;
  followers: string[];
  followings: string[];
}

export interface Comment {
  _id: string;
  isDeleted: boolean;
  userId: User;
  postId: string;
  content: string;
  likes: string[];
  depth: number;
  left: number;
  right: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'FOLLOW' | 'LIKE' | 'COMMENT' | 'COMMENT_REPLY';
  message: string;
  senderId: User;
  recipientId: string;
  postId?: Post;
  commentId?: Comment;
  read: boolean;
  createdAt: string;
};
