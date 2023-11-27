"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllComment = exports.getAllCommentForUser = exports.getAllCommentForProduct = exports.adminDeleteComment = exports.updateComment = exports.deleteComment = exports.addCommentToProduct = void 0;
const comment_model_1 = require("../models/comment.model");
const factor_comment_review_controller_1 = require("./factor.comment.review.controller");
// @desc    Add comment to product
// @route   POST /api/v1/comments/product/:productId
// @access  Private (User)
exports.addCommentToProduct = (0, factor_comment_review_controller_1.addToProduct)(comment_model_1.Comment, "comment");
// @desc    Delete Comment
// @route   DELETE /api/v1/comments/user/:id => commentId
// @access  Private (User)
exports.deleteComment = (0, factor_comment_review_controller_1.deleteFromProductByUser)(comment_model_1.Comment, "comment");
// @desc    Update Comment
// @route   PUT /api/v1/comments/user/:id => commentId
// @access  Private (User)
exports.updateComment = (0, factor_comment_review_controller_1.updateForProductByUser)(comment_model_1.Comment, "comment");
// @desc    admin delete Comment
// @route   DELETE /api/v1/comments/admin/:id => commentId
// @access  Private (Admin)
exports.adminDeleteComment = (0, factor_comment_review_controller_1.adminDeleteFromProduct)(comment_model_1.Comment, "comment");
// @desc    Get all Comment for a product
// @route   GET /api/v1/comments/product/:productId
// @access  Public
exports.getAllCommentForProduct = (0, factor_comment_review_controller_1.getAllForProduct)(comment_model_1.Comment, ["user"]);
// @desc    Get all for a user
// @route   GET /api/v1/comments/user/:userId
// @access  Private
exports.getAllCommentForUser = (0, factor_comment_review_controller_1.getAllForUser)(comment_model_1.Comment);
// @desc    Get all Comment
// @route   GET /api/v1/comments/admin
// @access  Private (Admin)
exports.getAllComment = (0, factor_comment_review_controller_1.getAll)(comment_model_1.Comment);
