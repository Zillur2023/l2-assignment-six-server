import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { IPost } from "./post.interface";
import Post from "./post.model";

const createPostIntoDB = async (payload: IPost) => {
  const user = await User.findById(payload.author);
  console.log({user})

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await Post.create(payload);

  return result;
};

const updateUpvotesIntoDB = async (id: string) => {
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  post.upvotes = (post.upvotes || 0) + 1;
  post.voteScore = (post.upvotes || 0) - (post.downvotes || 0);

  return await post.save();
};
const updateDownvotesIntoDB = async (id: string) => {
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  const currentVoteScore = post.voteScore ?? 0; // Default to 0 if undefined

  // Check if the voteScore is greater than 0 before incrementing downvotes
  if (currentVoteScore > 0) {
  post.downvotes = (post.downvotes || 0) + 1;
  post.voteScore = (post.upvotes || 0) - post.downvotes;
}

  return await post.save();
};

export const PostServices = {
  createPostIntoDB,
  updateUpvotesIntoDB,
  updateDownvotesIntoDB,
};
