"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    comments: [
        {
            user: {
                userId: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "User",
                },
                email: {
                    type: String,
                }
            },
            comment: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            replies: [
                {
                    user: {
                        userId: {
                            type: mongoose_1.Schema.Types.ObjectId,
                            ref: "User",
                        },
                        email: {
                            type: String,
                        }
                    },
                    reply: {
                        type: String,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
    ],
}, {
    timestamps: true,
});
exports.Blog = (0, mongoose_1.model)("Blog", blogSchema);
