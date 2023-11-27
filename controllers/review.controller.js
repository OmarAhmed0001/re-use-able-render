"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = exports.getAllReviewsForUser = exports.getAllReviewsForProduct = exports.adminDeleteReview = exports.updateReview = exports.deleteReview = exports.addReviewToProduct = void 0;
const review_model_1 = require("../models/review.model");
const factor_comment_review_controller_1 = require("./factor.comment.review.controller");
// @desc    Add review to product
// @route   POST /api/v1/reviews/product/:productId
// @access  Private (User)
exports.addReviewToProduct = (0, factor_comment_review_controller_1.addToProduct)(review_model_1.Review, "review");
// @desc    Delete review
// @route   DELETE /api/v1/reviews/user/:id => reviewId
// @access  Private (User)
exports.deleteReview = (0, factor_comment_review_controller_1.deleteFromProductByUser)(review_model_1.Review, "review");
// @desc    Update review
// @route   PUT /api/v1/reviews/user/:id => reviewId
// @access  Private (User)
exports.updateReview = (0, factor_comment_review_controller_1.updateForProductByUser)(review_model_1.Review, "review");
// @desc    admin delete review
// @route   DELETE /api/v1/reviews/admin/:id => reviewId
// @access  Private (Admin)
exports.adminDeleteReview = (0, factor_comment_review_controller_1.adminDeleteFromProduct)(review_model_1.Review, "review");
// @desc    Get all reviews for a product
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
exports.getAllReviewsForProduct = (0, factor_comment_review_controller_1.getAllForProduct)(review_model_1.Review);
// @desc    Get all for a user
// @route   GET /api/v1/reviews/user/:userId
// @access  Private
exports.getAllReviewsForUser = (0, factor_comment_review_controller_1.getAllForUser)(review_model_1.Review);
// @desc    Get all reviews
// @route   GET /api/v1/reviews/admin
// @access  Private (Admin)
exports.getAllReviews = (0, factor_comment_review_controller_1.getAll)(review_model_1.Review);
