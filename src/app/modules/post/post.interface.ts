import { Types } from 'mongoose';

export interface IPost {
  _id?: string;
  title: string;
  content: string;
  category: string;
  isPremium?: boolean; // Optional because it has a default value
  imageUrl?: string; // Optional
  upvotes?: number;     // Optional, defaults to 0
  downvotes?: number;   // Optional, defaults to 0
  voteScore?: number;   // Optional, defaults to 0
  author: Types.ObjectId; // References the User model
  createdAt?: Date; // Automatically handled by Mongoose timestamps
  updatedAt?: Date; // Automatically handled by Mongoose timestamps
}