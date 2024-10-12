import { Router } from "express";
import { PostControllers } from "./post.controller";

const router = Router()

router.post('/create', PostControllers.createPost)

router.get('/all-post/:id?', PostControllers.getAllPost); // The `?` makes the id optional

router.put("/upvotes", PostControllers.updateUpvotes);

router.put("/downvotes", PostControllers.updateDownvotes);

router.put("/comment", PostControllers.updateComment);

router.put("/update/:id", PostControllers.updatePost);




export const PostRouters = router;