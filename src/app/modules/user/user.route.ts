import { Router } from "express";
import { UserControllers } from "./user.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router()
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

router.post('/create', multerUpload.single("image"), UserControllers.createUser)

router.get('/allUser', UserControllers.getAllUser)

router.get('/:email', UserControllers.getUser)

router.get('/:id', UserControllers.getUserById)

router.put("/update/:id", UserControllers.updateUser);

router.put("/followers/:id", UserControllers.updateFollowers);

router.put("/following/:id", UserControllers.updateFollowing);

router.put("/isVerified/:id", UserControllers.updateVeirfied);



export const UserRouters = router;