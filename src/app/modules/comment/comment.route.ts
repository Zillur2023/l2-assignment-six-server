import { Router } from "express";
import { CommentControllers } from "./comment.controller";

const router = Router()

router.post('/create', CommentControllers.createComment)

router.get('/all-comment/:postId', CommentControllers.getAllComment)

router.put('/update/:id', CommentControllers.updateComment)

router.put('/delete/:id', CommentControllers.deleteComment)

export const CommentRouters = router;