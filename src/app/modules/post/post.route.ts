import { Router } from "express";
import { PostControllers } from "./post.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router()

router.post('/create', multerUpload.single("image"), PostControllers.createPost)

router.get('/all-post/:postId?/:userId?', PostControllers.getAllPost);

router.put("/upvotes", PostControllers.updateUpvotes);

router.put("/downvotes", PostControllers.updateDownvotes);

router.put("/update", multerUpload.single("image"), PostControllers.updatePost);

router.put("/comment", PostControllers.updateComment);

router.delete("/delete/:postId", PostControllers.deletePost);

router.get("/isAvailable-verified/:id", PostControllers.isAvailableForVerified);




export const PostRouters = router;