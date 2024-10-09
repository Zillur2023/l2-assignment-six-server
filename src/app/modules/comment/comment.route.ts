import { Router } from "express";
import { CommentControllers } from "./comment.controller";

const router = Router()

router.post('/create/:postId', CommentControllers.createComment)

router.put('/update/:id', CommentControllers.updateComment)

router.put('/delete/:id', CommentControllers.deleteComment)

export const CommentRouters = router;