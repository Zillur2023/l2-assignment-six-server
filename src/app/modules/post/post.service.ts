import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { IPost } from "./post.interface";
import Post from "./post.model";
import mongoose from "mongoose";

const createPostIntoDB = async (payload: IPost) => {
  const user = await User.findById(payload.author);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await Post.create(payload);

  return result;
};

const deleteUnassociatedPosts = async () => {
  try {
    // Step 1: Get all user IDs and all post IDs
    const allUserIds = await User.find().select('_id').lean(); // Get all user IDs
    const allPostIds = await Post.find().select('_id author').lean(); // Get all post IDs with their authors

    // Extract user IDs from the array of user objects
    const userIds = allUserIds.map(user => user._id.toString()); // Convert ObjectId to string for comparison

    // Step 2: Filter posts that do not have an associated user ID
    const postIdsToDelete = allPostIds
      .filter(post => !userIds.includes(post.author.toString())) // Keep posts without a valid user
      .map(post => post._id); // Get the IDs of those posts

    // Step 3: Delete the unassociated posts
    if (postIdsToDelete.length > 0) {
      await Post.deleteMany({ _id: { $in: postIdsToDelete } });
      console.log(`Deleted ${postIdsToDelete.length} posts without associated users.`);
    } else {
      // console.log('No posts to delete.');
    }
  } catch (error) {
    console.error('Error deleting unassociated posts:', error);
  }
};



const getAllPostFromDB = async (
  postId?: string, 
  userId?: string, 
  searchTerm?: string, 
  category?: string,
  sortBy?: "highestUpvotes" | "lowestUpvotes" | "highestDownvotes" | "lowestDownvotes"
) => {
  await deleteUnassociatedPosts(); // Delete posts without associated users

  const pipeline: any[] = [];

  // If postId is provided, fetch the specific post
  if (postId) {
    pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(postId) } });
  } else if (userId) {
    // If userId is provided, fetch posts by that user
    pipeline.push({ $match: { author: new mongoose.Types.ObjectId(userId) } });
  } else {
    // If searchTerm is provided, search by title (case-insensitive)
    if (searchTerm) {
      pipeline.push({
        $match: { title: { $regex: searchTerm, $options: "i" } }, // 'i' for case-insensitive
      });
    }
    // If category is provided, filter by category
    if (category) {
      pipeline.push({
        $match: { category: category },
      });
    }
  }

  // Lookup stages for author and comments
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users", // Collection name for upvotes
        localField: "upvotes",
        foreignField: "_id",
        as: "upvotes",
      },
    },
    {
      $lookup: {
        from: "users", // Collection name for downvotes
        localField: "downvotes",
        foreignField: "_id",
        as: "downvotes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "comments",
        foreignField: "_id",
        as: "comments",
      },
    }
  );

  // Execute the aggregation pipeline to get all posts
  const result = await Post.aggregate(pipeline).exec();

  // Sorting based on upvotes and downvotes after fetching
  if (sortBy) {
    result.sort((a, b) => {
      const upvoteCountA = a.upvotes ? a.upvotes.length : 0;
      const upvoteCountB = b.upvotes ? b.upvotes.length : 0;
      const downvoteCountA = a.downvotes ? a.downvotes.length : 0;
      const downvoteCountB = b.downvotes ? b.downvotes.length : 0;

      switch (sortBy) {
        case "highestUpvotes":
          return upvoteCountB - upvoteCountA; // Sort descending
        case "lowestUpvotes":
          return upvoteCountA - upvoteCountB; // Sort ascending
        case "highestDownvotes":
          return downvoteCountB - downvoteCountA; // Sort descending
        case "lowestDownvotes":
          return downvoteCountA - downvoteCountB; // Sort ascending
        default:
         return 0; 
      }
    });
  } else {
    // Default sort by highest upvotes if no sort option is provided
    result.sort((a, b) => {
      const upvoteCountA = a.upvotes ? a.upvotes.length : 0;
      const upvoteCountB = b.upvotes ? b.upvotes.length : 0;
      return upvoteCountB - upvoteCountA; // Sort by upvotes descending
    });
  }

  return result;
};









export const updateUpvotesIntoDB = async (userId: string, postId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  // Find the user by its ID
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
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
   await Post.findByIdAndUpdate(
    postObjectId,
    {$pull: {downvotes: userObjectId}},
    {new: true}
   )
  } else {
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
  }

  return Post.findById(postObjectId); // Return the updated post
};

export const updateDownvotesIntoDB = async (userId: string, postId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  // Find the user by its ID
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

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
    // throw new AppError(httpStatus.FORBIDDEN, "You cannot downvote after upvoting. Remove upvote first.");
    await Post.findByIdAndUpdate(
      postObjectId,
      {$pull: {upvotes: userObjectId}},
      {new: true}
     )
  } else {
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

const deletePostFromDB = async (postId: string) => {
  const result = await Post.findByIdAndDelete(postId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  return result;
};

// const isAvailableForVerifiedIntoDB = async (id: string) => {
//   const user = await User.findById(id);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }

//   // Query 1: Find posts with upvotes that include the user
//   const postsWithUserUpvoted = await Post.find({
//     author: id,
//     // $expr: { $gt: [{ $size: "$upvotes" }, 0] },
//     // upvotes: { $elemMatch: { $eq: user._id } } 
//   }).select("upvotes");

//     // Flatten the upvotes from all posts into a single array
//     const allUpvotes = postsWithUserUpvoted.flatMap((post) => post.upvotes);


//   // If there are more than 1 post where the user has been upvoted, return true
//   // if (postsWithUserUpvoted.length > 1) {
//   //   return true;
//   // } else {
//   //   if (postsWithUserUpvoted.length > 0) {
//   //     return true
//   //   }
//   // }

//   // // Query 2: Find posts with upvotes but the user is not in the upvotes array
//   // const postsWithoutUserUpvoted = await Post.find({
//   //   author: id,
//   //   $expr: { $gt: [{ $size: "$upvotes" }, 0] },
//   //   upvotes: { $not: { $elemMatch: { $eq: user._id } } } // User is not in the upvotes array
//   // });

//   // // If there are any such posts, return true
//   // if (postsWithoutUserUpvoted.length > 0) {
//   //   return true;
//   // }

//   // Otherwise, return false
//   // return false;
//   return postsWithUserUpvoted; 
// };

const isAvailableForVerifiedIntoDB = async (id: string) => {
    const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
// Fetch posts by author ID that have upvotes
const postsWithUserUpvoted = await Post.find(
  { author: id, upvotes: { $exists: true, $ne: [] } } // Ensuring posts have upvotes
).select("upvotes");

// Flatten and filter the upvotes to check if the user has upvoted any post
const userUpvotes = postsWithUserUpvoted
  .flatMap(post => post.upvotes) // Flatten upvotes from all posts
  .filter(upvote => !upvote?.equals(user._id)); // Filter for the user's upvotes


return userUpvotes
}

export const PostServices = {
  createPostIntoDB,
  getAllPostFromDB,
  updateUpvotesIntoDB,
  updateDownvotesIntoDB,
  updatePostIntoDB,
  updateCommentIntoDB,
  deletePostFromDB,
  isAvailableForVerifiedIntoDB
};

// const getAllPostFromDB = async (postId?: string, userId?: string) => {
//   let result;

//   if (postId) {
//     // If postId is provided, fetch the specific post
//     result = await Post.find({ _id: postId })
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   } else if (userId) {
//     // If userId is provided, fetch posts by that user
//     result = await Post.find({ author: userId })
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   } else {
//     // If neither postId nor userId is provided, fetch all posts
//     result = await Post.find()
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   }

//   return result;
// };
