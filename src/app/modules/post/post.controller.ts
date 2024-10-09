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
const updateUpvotes = catchAsync(async (req, res) => {
    const {id} = req.params
    const result = await PostServices.updateUpvotesIntoDB(id)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Upvotes update successfully',
        data: result
    })
  })
const updateDownvotes = catchAsync(async (req, res) => {
    const {id} = req.params
    const result = await PostServices.updateDownvotesIntoDB(id)
  
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Downvotes update successfully',
        data: result
    })
  })

  export const PostControllers = {
    createPost,
    updateUpvotes,
    updateDownvotes
  }