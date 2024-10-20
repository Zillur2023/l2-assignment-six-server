import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { PostServices } from "./post.service"
import { truncateSync } from "fs"


const createPost = catchAsync(async (req, res) => {
    const result = await PostServices.createPostIntoDB({
      ...JSON.parse(req.body.data),
      image: req.file?.path
    })
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Create post successfully',
        data: result
    })
  })
  const getAllPost = catchAsync(async (req, res) => {
    const { postId, userId } = req.params as {
      postId?: string;
      userId?: string;
    };
    console.log({postId})
  
    const { searchTerm, category, sortBy } = req.query as {
      searchTerm?: string;
      category?: string;
      sortBy?: "highestUpvotes" | "lowestUpvotes" | "highestDownvotes" | "lowestDownvotes"
    };
  
    // Fetch posts from the database using the params and query parameters
    const result = await PostServices.getAllPostFromDB(postId, userId, searchTerm, category, sortBy);
  
    // Send response back to the client
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Posts fetched successfully',
      data: result,
    });
  });
  
const updateUpvotes = catchAsync(async (req, res) => {
  const {id} = req.params
  const { userId, postId } = req.body;
    const result = await PostServices.updateUpvotesIntoDB(userId, postId )
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Upvotes update successfully',
        data: result
    })
  })
const updateDownvotes = catchAsync(async (req, res) => {
    const {id} = req.params
    const { userId, postId } = req.body;
    const result = await PostServices.updateDownvotesIntoDB(userId, postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Downvotes update successfully',
        data: result
    })
  })
  
const updatePost = catchAsync(async (req, res) => {
  const result = await PostServices.updatePostIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path
  })
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post update successfully',
        data: result
    })
  })
const updateComment = catchAsync(async (req, res) => {
  const { userId, postId } = req.body;
    const result = await PostServices.updateCommentIntoDB(userId, postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment update successfully',
        data: result
    })
  })
const deletePost = catchAsync(async (req, res) => {
    const {postId} = req.params
    const result = await PostServices.deletePostFromDB(postId)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result
    })
  })

  const isAvailableForVerified = catchAsync(async (req, res) => {
    const {id} = req.params
    const result = await PostServices.isAvailableForVerifiedIntoDB(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Available for verified successfully',
      data: result,
    });
  });


  export const PostControllers = {
    createPost,
    getAllPost,
    updateUpvotes,
    updateDownvotes,
    updatePost,
    updateComment,
    deletePost,
    isAvailableForVerified
  }

  // const getAllPost = catchAsync(async (req, res) => {
  //   const { postId, userId } = req.params as { postId?: string; userId?: string }; // Retrieve ids from URL parameters
  
  //   // Retrieve posts based on postId or userId
  //   const result = await PostServices.getAllPostFromDB(postId, userId);
  
  //   sendResponse(res, {
  //     statusCode: httpStatus.OK,
  //     success: true,
  //     message: 'Get all posts successfully',
  //     data: result,
  //   });
  // });