import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { PostServices } from "./post.service"


const createPost = catchAsync(async (req, res) => {
    const result = await PostServices.createPostIntoDB(req.body)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Create post successfully',
        data: result
    })
  })
const getAllPost = catchAsync(async (req, res) => {
  const { id } = req.params as { id?: string }; // Retrieve id from URL parameters
  console.log({id})
    const result = await PostServices.getAllPostFromDB(id)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get all post successfully',
        data: result
    })
  })
  
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
    const result = await PostServices.updatePostIntoDB(req.body)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Downvotes update successfully',
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


  export const PostControllers = {
    createPost,
    getAllPost,
    updateUpvotes,
    updateDownvotes,
    updatePost,
    updateComment
  }