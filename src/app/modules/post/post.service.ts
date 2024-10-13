import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { IPost } from "./post.interface";
import Post from "./post.model";
import mongoose from "mongoose";

const createPostIntoDB = async (payload: IPost) => {
  const user = await User.findById(payload.author);
  console.log({ user });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await Post.create(payload);

  return result;
};

const getAllPostFromDB = async (id?: string) => {
  let result;
  if (id) {
    result = await Post.find({ _id:id }).populate("author").populate("comments");
  } else {
    result = await Post.find().populate("author").populate("comments");
  }

  return result;
};

export const updateUpvotesIntoDB = async (userId: string, postId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  // Find the post by its ID
  const post = await Post.findById(postObjectId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (!post.upvotes) {
    post.upvotes = [];
  }
  if (!post.downvotes) {
    post.downvotes = [];
  }

  // Check if the user has already upvoted
  const hasUpvoted = post.upvotes.some((upvoteId) => upvoteId.equals(userObjectId));

  // Check if the user has already downvoted (they should not be allowed to upvote if so)
  const hasDownvoted = post.downvotes.some((downvoteId) => downvoteId.equals(userObjectId));

  if (hasDownvoted) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot upvote after downvoting. Remove downvote first.");
  }

  if (hasUpvoted) {
    // If already upvoted, remove the upvote
    await Post.findByIdAndUpdate(
      postObjectId,
      { $pull: { upvotes: userObjectId } },
      { new: true }
    );
  } else {
    // Add the upvote
    await Post.findByIdAndUpdate(
      postObjectId,
      { $addToSet: { upvotes: userObjectId } },
      { new: true }
    );
  }

  return Post.findById(postObjectId); // Return the updated post
};

export const updateDownvotesIntoDB = async (userId: string, postId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  // Find the post by its ID
  const post = await Post.findById(postObjectId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (!post.upvotes) {
    post.upvotes = [];
  }
  if (!post.downvotes) {
    post.downvotes = [];
  }

  // Check if the user has already downvoted
  const hasDownvoted = post.downvotes.some((downvoteId) => downvoteId.equals(userObjectId));

  // Check if the user has already upvoted (they should not be allowed to downvote if so)
  const hasUpvoted = post.upvotes.some((upvoteId) => upvoteId.equals(userObjectId));

  if (hasUpvoted) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot downvote after upvoting. Remove upvote first.");
  }

  if (hasDownvoted) {
    // If already downvoted, remove the downvote
    await Post.findByIdAndUpdate(
      postObjectId,
      { $pull: { downvotes: userObjectId } },
      { new: true }
    );
  } else {
    // Add the downvote
    await Post.findByIdAndUpdate(
      postObjectId,
      { $addToSet: { downvotes: userObjectId } },
      { new: true }
    );
  }

  return Post.findById(postObjectId); // Return the updated post
};

export const updateCommentIntoDB = async (userId: string, postId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  // Find the user by its ID
  const user = await User.findById(userObjectId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  // Find the post by its ID
  const post = await Post.findById(postObjectId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }


  if (user && post) {
    // Add the upvote
    await Post.findByIdAndUpdate(
      postObjectId,
      { $addToSet: { comment: userObjectId } },
      { new: true }
    );
  }

  return Post.findById(postObjectId); // Return the updated post
};

const updatePostIntoDB = async (payload: IPost) => {
  const result = await Post.findByIdAndUpdate(payload._id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  return result;
};


export const PostServices = {
  createPostIntoDB,
  getAllPostFromDB,
  updateUpvotesIntoDB,
  updateDownvotesIntoDB,
  updatePostIntoDB,
  updateCommentIntoDB
};
