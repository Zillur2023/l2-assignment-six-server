"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouters = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.post('/create', user_controller_1.UserControllers.createUser);
router.get('/allUser', user_controller_1.UserControllers.getAllUser);
router.get('/:email', user_controller_1.UserControllers.getUser);
router.get('/:id', user_controller_1.UserControllers.getUserById);
router.put("/update/:id", user_controller_1.UserControllers.updateUser);
router.put("/followers/:id", user_controller_1.UserControllers.updateFollowers);
router.put("/following/:id", user_controller_1.UserControllers.updateFollowing);
exports.UserRouters = router;
