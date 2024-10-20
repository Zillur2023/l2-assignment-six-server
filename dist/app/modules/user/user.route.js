"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouters = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
// router.post(
//     '/create-student',
//     // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
//     upload.single('file'),
//     (req: Request, res: Response, next: NextFunction) => {
//       req.body = JSON.parse(req.body.data);
//       next();
//     },
//     validateRequest(createStudentValidationSchema),
//     UserControllers.createStudent,
//   );
router.post('/create', multer_config_1.multerUpload.single("image"), user_controller_1.UserControllers.createUser);
router.get('/allUser', user_controller_1.UserControllers.getAllUser);
router.get('/:email', user_controller_1.UserControllers.getUser);
router.get('/:id', user_controller_1.UserControllers.getUserById);
router.put("/update-profile", multer_config_1.multerUpload.single("image"), user_controller_1.UserControllers.updateUserProfile);
router.put("/followers/:id", user_controller_1.UserControllers.updateFollowers);
router.put("/update-follow-unfollow/:id", user_controller_1.UserControllers.updateFollowAndUnfollow);
// router.get("/isAvailable-verified/:id", UserControllers.isAvailableForVerified);
router.put("/update-verified/:id", user_controller_1.UserControllers.updateVeirfied);
exports.UserRouters = router;
