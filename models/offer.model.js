"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const mongoose_1 = require("mongoose");
const offerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    percentage: {
        type: Number,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    typeOfBanner: {
        type: String,
        enum: ["vertical", "horizontal"],
        required: true,
    },
    imageOfBanner: {
        type: String,
        required: true,
    },
    discountDepartment: {
        key: {
            type: String,
            enum: ["allProducts", "products", "categories", "subcategories"],
            required: true,
        },
        value: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                required: true,
            },
        ],
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
exports.Offer = (0, mongoose_1.model)("Offer", offerSchema);
