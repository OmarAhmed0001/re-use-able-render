"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["normal", "marketing"],
        default: "normal",
    },
    title: {
        type: String,
    },
    code: {
        type: String,
        unique: true,
    },
    limit: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    active: {
        type: Boolean,
        default: true,
    },
    discountDepartment: {
        key: {
            type: String,
            enum: ["allProducts", "products", "categories", "subcategories"],
        },
        value: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
            },
        ],
    },
    users: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
            },
            usedNumber: {
                type: Number,
                default: 0,
            },
        },
    ],
    commissionMarketer: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.Coupon = (0, mongoose_1.model)("Coupon", couponSchema);
