"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const blog_validator_1 = require("../validations/blog.validator");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const { protectedMiddleware } = require("../middlewares/protected.middleware");
const blogRouter = (0, express_1.Router)();
blogRouter
    .route("/")
    .get(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER, user_interface_1.Role.Marketer, user_interface_1.Role.Guest), blog_controller_1.getAllBlogs);
blogRouter
    .route("/:id")
    .get(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER, user_interface_1.Role.Marketer, user_interface_1.Role.Guest), blog_controller_1.getOneBlog);
blogRouter
    .route("/")
    .post(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), (0, validation_middleware_1.validate)(blog_validator_1.BlogCreateValidator), blog_controller_1.createBlog);
blogRouter
    .route("/:id")
    .put(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), (0, validation_middleware_1.validate)(blog_validator_1.BlogUpdateValidator), blog_controller_1.updateBlog);
blogRouter
    .route("/:id")
    .delete(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), blog_controller_1.deleteBlog);
blogRouter
    .route("/addComment/:id")
    .put(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), blog_controller_1.addComment);
blogRouter
    .route("/deleteComment/:id")
    .put(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER), blog_controller_1.deleteComment);
blogRouter
    .route("/addReply/:id")
    .put(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER), blog_controller_1.addReply);
blogRouter
    .route("/deleteReply/:id")
    .put(protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER), blog_controller_1.deleteReply);
exports.default = blogRouter;
