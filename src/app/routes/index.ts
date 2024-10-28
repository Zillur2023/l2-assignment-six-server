import { Router } from "express";
import { UserRouters } from "../modules/user/user.route";
import { PostRouters } from "../modules/post/post.route";
import { CommentRouters } from "../modules/comment/comment.route";
import { PaymentRouters } from "../modules/payment/payment.route";
import { AuthRouters } from "../modules/auth/auth.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRouters,
  },

  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/post",
    route: PostRouters,
  },
  {
    path: "/comment",
    route: CommentRouters,
  },
  {
    path: "/payment",
    route: PaymentRouters,
  },
  {
    path: '/auth',
    route: AuthRouters,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
