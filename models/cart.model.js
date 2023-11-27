"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    isPointsUsed: { type: Boolean, default: false },
    isFreezed: { type: Boolean, default: false },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cartItems: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            total: {
                type: Number,
                required: true,
            },
            properties: {
                type: [
                    {
                        key_en: { type: String, required: true },
                        key_ar: { type: String, required: true },
                        value_en: { type: String, required: true },
                        value_ar: { type: String, required: true },
                    },
                ],
                required: false,
                default: [],
            },
        },
    ],
    coupon: {
        couponReference: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Coupon",
        },
        used: {
            type: Boolean,
            default: false,
        },
        commissionMarketer: {
            type: Number,
            default: 0,
        },
    },
    totalCartPrice: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.Cart = (0, mongoose_1.model)("Cart", cartSchema);
