"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const mongoose_1 = require("mongoose");
const repositorySchema = new mongoose_1.Schema({
    name_en: {
        type: String,
        required: true,
    },
    name_ar: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    products: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 0,
            },
        },
    ],
    address: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.Repository = (0, mongoose_1.model)("Repository", repositorySchema);
