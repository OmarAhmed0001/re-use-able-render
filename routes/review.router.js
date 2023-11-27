"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const review_controller_1 = require("../controllers/review.controller");
const review_validator_1 = require("../validations/review.validator");
const reviewRouter = (0, express_1.Router)();
/// These routers for products
// @route     /api/v1/reviews/product/:productId
reviewRouter
    .route("/product/:productId")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(review_validator_1.addReviewToProductValidator), review_controller_1.addReviewToProduct) // user
    .get(review_controller_1.getAllReviewsForProduct); // not
///// These routers for admin only
// @route    /api/v1/reviews/admin/:id => reviewId
reviewRouter
    .route("/admin/:id")
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), review_controller_1.adminDeleteReview); //admin root admina adminb
// @route    /api/v1/reviews/admin
reviewRouter
    .route("/admin")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), review_controller_1.getAllReviews); //admin root admina adminb adminc subadmin
///////// These routers for user only
//  @route   /api/v1/reviews/user/userId
reviewRouter
    .route("/user/:userId")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), review_controller_1.getAllReviewsForUser); //admin root admina adminb adminc subadmin
//  @route   /api/v1/reviews/user/:id => reviewId
reviewRouter
    .route("/user/:id")
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(review_validator_1.updateReviewToProductValidator), review_controller_1.updateReview) // user
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), review_controller_1.deleteReview); // user
exports.default = reviewRouter;
