"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    invoiceId: { type: String },
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cartId: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    totalQuantity: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "initiated",
            "created",
            "on going",
            "on delivered",
            "completed",
            "refund",
        ],
        default: "initiated",
    },
    tracking: {
        type: [
            {
                path: { type: String },
                orderNumberTracking: { type: String },
            },
        ],
        required: false,
        default: [],
    },
    orderNotes: {
        type: String,
    },
    email: {
        type: String,
    },
    verificationCode: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCodeExpiresAt: {
        type: Number,
        required: true,
    },
    sendToDelivery: {
        type: Boolean,
        default: false,
    },
    paymentStatus: {
        type: String,
        enum: ["payment_not_paid", "payment_paid", "payment_failed"],
        default: "payment_not_paid",
    },
    paymentType: {
        type: String,
        enum: ["online", "cash", "both"],
        required: true,
    },
    payWith: {
        type: {
            type: String,
            enum: ["creditcard", "applepay", "stcpay", "none"],
            // required: true,
            default: "none",
        },
        source: {
            type: Object,
        },
    },
    onlineItems: {
        items: [
            {
                product: {
                    type: mongoose_1.Types.ObjectId,
                    ref: "Product",
                },
                quantity: {
                    type: Number,
                    // required: true,
                },
                totalPrice: {
                    type: Number,
                    // required: true,
                },
                properties: {
                    type: [
                        {
                            key_ar: { type: String, required: true },
                            key_en: { type: String, required: true },
                            value_ar: { type: String, required: true },
                            value_en: { type: String, required: true },
                        },
                    ],
                    required: false,
                    default: [],
                },
                repositories: [
                    {
                        repository: { type: mongoose_1.Types.ObjectId },
                        quantity: { type: Number },
                    },
                ],
            },
        ],
        quantity: {
            type: Number,
            // required: true,
        },
        totalPrice: {
            type: Number,
            // required: true,
        },
    },
    cashItems: {
        items: [
            {
                product: {
                    type: mongoose_1.Types.ObjectId,
                    ref: "Product",
                },
                quantity: {
                    type: Number,
                    // required: true,
                },
                totalPrice: {
                    type: Number,
                    // required: true,
                },
                properties: {
                    type: [
                        {
                            key_ar: { type: String, required: true },
                            key_en: { type: String, required: true },
                            value_ar: { type: String, required: true },
                            value_en: { type: String, required: true },
                        },
                    ],
                    required: false,
                    default: [],
                },
                repositories: [
                    {
                        repository: { type: mongoose_1.Types.ObjectId },
                        quantity: { type: Number },
                    },
                ],
            },
        ],
        quantity: {
            type: Number,
            // required: true,
        },
        totalPrice: {
            type: Number,
            // required: true,
        },
    },
    name: {
        type: String,
    },
    area: {
        type: String,
    },
    address: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
