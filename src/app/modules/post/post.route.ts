import { Router } from "express";
import { PostControllers } from "./post.controller";

const router = Router()

router.post('/create', PostControllers.createPost)

router.put("/upvotes/:id", PostControllers.updateUpvotes);

router.put("/downvotes/:id", PostControllers.updateDownvotes);

router.put("/update/:id", PostControllers.updatePost);



export const PostRouters = router;