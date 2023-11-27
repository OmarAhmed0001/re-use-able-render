"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const comment_controller_1 = require("../controllers/comment.controller");
const comment_validator_1 = require("../validations/comment.validator");
const CommentRouter = (0, express_1.Router)();
/// These routers for products
// @route   /api/v1/Comments/product/:productId
CommentRouter.route("/product/:productId")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(comment_validator_1.addCommentToProductValidator), comment_controller_1.addCommentToProduct) // user
    .get(comment_controller_1.getAllCommentForProduct); // not
///// These routers for admin only
// /api/v1/Comments/admin/:id => CommentId
CommentRouter.route("/admin/:id").delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), comment_controller_1.adminDeleteComment); //admin root admina adminb
// @route    /api/v1/comments/admin
CommentRouter.route("/admin").get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), comment_controller_1.getAllComment); //admin root admina adminb adminc subadmin
///////// These routers for user only
//  @route   /api/v1/comments/user/userId
CommentRouter.route("/user/:userId").get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), comment_controller_1.getAllCommentForUser); //admin root admina adminb adminc subadmin
// @route  /api/v1/Comments/user/:id => CommentId
CommentRouter.route("/user/:id")
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(comment_validator_1.updateCommentToProductValidator), comment_controller_1.updateComment) // user
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), comment_controller_1.deleteComment); // user
exports.default = CommentRouter;
