import { Router } from "express";
import { UserControllers } from "./user.controller";

const router = Router()

router.post('/create', UserControllers.createUser)
router.get('/allUser', UserControllers.getAllUser)
router.get('/:email', UserControllers.getUser)
router.get('/:id', UserControllers.getUserById)
router.put("/update/:id", UserControllers.updateUser);
router.put("/followers/:id", UserControllers.updateFollowers);
router.put("/following/:id", UserControllers.updateFollowing);



export const UserRouters = router;