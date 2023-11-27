"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = exports.addReply = exports.deleteComment = exports.addComment = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getOneBlog = exports.getAllBlogs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const blog_model_1 = require("../models/blog.model");
const factory_controller_1 = require("./factory.controller");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
// @desc     Get All Blogs
// @route    GET/api/v1/blogs
// @access   Public
exports.getAllBlogs = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- find all blogs
    const blogs = await blog_model_1.Blog.find({}).populate([
        {
            path: "comments.user.userId",
            select: "name role image",
        },
        {
            path: "comments.replies.user.userId",
            select: "name role image",
        },
    ]);
    // 2- check if there is no blogs
    if (blogs.length === 0) {
        return next(new ApiError_1.default({
            en: "not found",
            ar: "لا يوجد اي نتيجة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        results: blogs.length,
        data: blogs,
    });
});
// @desc     Get One Blog
// @route    GET/api/v1/blogs/:id
// @access   Public
exports.getOneBlog = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get blog id
    const blogId = req.params.id;
    // 2- find blog
    const blog = await blog_model_1.Blog.findById(blogId).populate([
        {
            path: "comments.user.userId",
            select: "name role image",
        },
        {
            path: "comments.replies.user.userId",
            select: "name role image",
        },
    ]);
    // 3- check if blog not found
    if (!blog) {
        return next(new ApiError_1.default({
            en: "Blog Not Found",
            ar: "المدونة غير موجودة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: blog,
    });
});
// @desc     Create New Blog
// @route    POST/api/v1/blogs
// @access   Private
exports.createBlog = (0, factory_controller_1.createNewItem)(blog_model_1.Blog);
// @desc     Update Specific Blog By Id
// @route    PUT/api/v1/blogs/:id
// @access   Private
exports.updateBlog = (0, factory_controller_1.updateOneItemById)(blog_model_1.Blog);
// @desc     Delete Specific Blog By Id
// @route    DELETE/api/v1/blogs/:id
// @access   Private
exports.deleteBlog = (0, factory_controller_1.deleteOneItemById)(blog_model_1.Blog);
// @desc     Add Comment To Blog
// @route    POST/api/v1/blogs/addComment/:id
// @access   Private
exports.addComment = (0, express_async_handler_1.default)(async (req, res, next) => {
    // id of the blog
    const blogId = req.params.id;
    // id of the user
    const userId = req.user._id;
    // comment
    const comment = req.body.comment;
    // find the blog
    const blog = await blog_model_1.Blog.findById(blogId);
    if (!blog) {
        return next(new ApiError_1.default({
            en: "Blog Not Found",
            ar: "المدونة غير موجودة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // add the comment
    await blog_model_1.Blog.findByIdAndUpdate(blogId, {
        $push: {
            comments: {
                user: { userId: userId, email: req.user.email },
                comment,
            },
        },
    }, { new: true });
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        success_en: "Comment Added Successfully",
        success_ar: "تم اضافة التعليق بنجاح",
    });
});
// @desc     Add Comment To Blog
// @route    POST/api/v1/blogs/deleteComment/:id
// @access   Private
exports.deleteComment = (0, express_async_handler_1.default)(async (req, res, next) => {
    // id of the blog
    const blogId = req.params.id;
    // id of the user
    const userId = req.user._id;
    // comment
    const commentId = req.body.commentId;
    // find the blog
    const blog = await blog_model_1.Blog.findById(blogId);
    if (!blog) {
        return next(new ApiError_1.default({
            en: "Blog Not Found",
            ar: "المدونة غير موجودة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // find the comment
    const comment = blog.comments.find((comment) => comment._id.toString() === commentId);
    if (!comment) {
        return next(new ApiError_1.default({
            en: "Comment Not Found",
            ar: "التعليق غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if the user is the owner of the comment
    if (comment.user.toString() !== userId.toString() &&
        (req.user.role === "guest" ||
            req.user.role === "marketer")) {
        return next(new ApiError_1.default({
            en: "You Are Not The Owner Of The Comment",
            ar: "أنت لست صاحب التعليق",
        }, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    // delete the comment
    await blog_model_1.Blog.findByIdAndUpdate({ _id: blogId }, {
        $pull: {
            comments: {
                _id: commentId,
            },
        },
    }, { new: true });
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        success_en: "Comment Deleted Successfully",
        success_ar: "تم حذف التعليق بنجاح",
    });
});
// @desc     Add Reply To Comment
// @route    POST/api/v1/blogs/addReply/:id
// @access   Private
exports.addReply = (0, express_async_handler_1.default)(async (req, res, next) => {
    const blogId = req.params.id;
    const userId = req.user._id;
    const commentId = req.body.commentId;
    const reply = req.body.reply;
    const blog = await blog_model_1.Blog.findOne({
        _id: blogId,
    });
    if (!blog) {
        return next(new ApiError_1.default({
            en: "Blog Not Found",
            ar: "المدونة غير موجودة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // i want add reply to the comment
    blog.comments.filter((comment) => {
        if ((comment === null || comment === void 0 ? void 0 : comment._id.toString()) === commentId) {
            comment.replies.push({
                user: { userId: userId, email: req.user.email || "" },
                reply,
                _id: undefined,
            });
        }
    });
    // save the blog
    await blog.save();
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        success_en: "Reply Added Successfully",
        success_ar: "تم اضافة الرد بنجاح",
    });
});
// @desc     Delete Reply From Comment
// @route    POST/api/v1/blogs/deleteReply/:id
// @access   Private
exports.deleteReply = (0, express_async_handler_1.default)(async (req, res, next) => {
    const blogId = req.params.id;
    const userId = req.user._id;
    const commentId = req.body.commentId;
    const replyId = req.body.replyId;
    const blog = await blog_model_1.Blog.findOne({ _id: blogId });
    if (!blog) {
        return next(new ApiError_1.default({
            en: "Blog Not Found",
            ar: "المدونة غير موجودة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const comment = blog.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
        return next(new ApiError_1.default({
            en: "Comment Not Found",
            ar: "التعليق غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const replyIndex = comment.replies.findIndex((r) => r._id.toString() === replyId);
    if (replyIndex === -1) {
        return next(new ApiError_1.default({
            en: "Reply Not Found",
            ar: "الرد غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if the user is the owner of the reply
    if (comment.replies[replyIndex].user.userId.toString() !== userId.toString() &&
        (req.user.role === "guest" ||
            req.user.role === "marketer")) {
        return next(new ApiError_1.default({
            en: "You Are Not The Owner Of The Reply",
            ar: "أنت لست صاحب الرد",
        }, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    comment.replies.splice(replyIndex, 1);
    // Save the updated blog
    await blog.save();
    // send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        success_en: "Reply Deleted Successfully",
        success_ar: "تم حذف الرد بنجاح",
    });
});
