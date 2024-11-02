import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/login", AuthControllers.loginUser);

<<<<<<< HEAD
router.post(
    '/change-password',
    auth(
      USER_ROLE.admin,
      USER_ROLE.user,
     
    ),
    validateRequest(AuthValidation.changePasswordValidationSchema),
    AuthControllers.changePassword,
  );
  
  router.post(
    '/refresh-token',
    validateRequest(AuthValidation.refreshTokenValidationSchema),
    AuthControllers.refreshToken,
  );
  
  router.post(
    '/forget-password',
    // validateRequest(AuthValidation.forgetPasswordValidationSchema),
    AuthControllers.forgetPassword,
  );
  
  router.post(
    '/reset-password',
    // validateRequest(AuthValidation.forgetPasswordValidationSchema),
    AuthControllers.resetPassword,
  );
=======
router.post("/change-password", AuthControllers.changePassword);

router.post("/refresh-token", AuthControllers.refreshToken);

router.post("/forget-password", AuthControllers.forgetPassword);

router.post("/reset-password", AuthControllers.resetPassword);
>>>>>>> ebe166f0837f43dd75e6bb5659e0f784006b11bf

export const AuthRouters = router;
