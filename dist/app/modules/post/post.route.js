"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRouters = void 0;
const express_1 = require("express");
const post_controller_1 = require("./post.controller");
const router = (0, express_1.Router)();
router.post('/create', post_controller_1.PostControllers.createPost);
router.get('/all-post/:id?', post_controller_1.PostControllers.getAllPost); // The `?` makes the id optional
router.put("/upvotes", post_controller_1.PostControllers.updateUpvotes);
router.put("/downvotes", post_controller_1.PostControllers.updateDownvotes);
router.put("/comment", post_controller_1.PostControllers.updateComment);
router.put("/update/:id", post_controller_1.PostControllers.updatePost);
exports.PostRouters = router;
