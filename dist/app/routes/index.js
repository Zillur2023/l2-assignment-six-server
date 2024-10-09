"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const post_route_1 = require("../modules/post/post.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRouters,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRouters,
    },
    {
        path: "/post",
        route: post_route_1.PostRouters,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
