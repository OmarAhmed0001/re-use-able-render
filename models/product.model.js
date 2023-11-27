"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
// import ApiError from "../utils/ApiError";
// import { StatusCodes } from "http-status-codes";
// import { type } from "os";
// import { generateDirectDownloadLink } from "../utils/googledrive";
//import { google } from 'googleapis';
const productSchema = new mongoose_1.Schema({
    title_en: {
        type: String,
        required: true,
    },
    title_ar: {
        type: String,
        required: true,
    },
    description_en: {
        type: String,
        required: true,
    },
    description_ar: {
        type: String,
        required: true,
    },
    priceBeforeDiscount: {
        type: Number,
        required: true,
    },
    priceAfterDiscount: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 100000000,
    },
    images: [
        {
            type: String,
            default: "",
        },
    ],
    sales: {
        type: Number,
        default: 0,
    },
    paymentType: {
        type: String,
        enum: ["online", "cash"],
        required: true,
    },
    keywords: [
        {
            type: String,
        },
    ],
    attributes: {
        type: [
            {
                key_ar: { type: String, required: true },
                key_en: { type: String, required: true },
                values: {
                    type: [
                        {
                            value_ar: { type: String, required: true },
                            value_en: { type: String, required: true },
                        },
                    ],
                    required: true,
                    validate: {
                        validator: (v) => Array.isArray(v) && v.length > 0,
                    },
                },
            },
        ],
        default: [],
        required: false,
    },
    qualities: {
        type: [
            {
                key_ar: { type: String, required: true },
                key_en: { type: String, required: true },
                values: {
                    type: [
                        {
                            value_ar: { type: String, required: true },
                            value_en: { type: String, required: true },
                            price: { type: Number, default: 0 },
                        },
                    ],
                    required: true,
                    validate: {
                        validator: (v) => Array.isArray(v) && v.length > 0,
                    },
                },
            },
        ],
        default: [],
        required: false,
    },
    qualitiesImages: {
        type: [
            {
                image: { type: String, required: true },
                qualities: {
                    type: [
                        {
                            key_ar: { type: String, required: true },
                            key_en: { type: String, required: true },
                            value_ar: { type: String, required: true },
                            value_en: { type: String, required: true },
                        },
                    ],
                    required: true,
                },
            },
        ],
        default: [],
        required: false,
    },
    category: {
        type: mongoose_1.Types.ObjectId,
        ref: "Category",
    },
    subCategory: {
        type: mongoose_1.Types.ObjectId,
        ref: "SubCategory",
    },
    likes: {
        type: [{ user: { type: mongoose_1.Types.ObjectId, ref: "User" } }],
        default: [],
    },
    rating: {
        type: Number,
        default: 0,
    },
    deliveryType: {
        type: String,
        enum: ["normal", "dropshipping"],
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    metaDataId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Meta"
    },
    offer: {
        type: mongoose_1.Types.ObjectId,
        ref: "Offer",
    },
    link: {
        type: String,
    },
    extention: {
        type: String,
    },
    directDownloadLink: {
        type: String,
    },
    repoQuantity: {
        type: Number,
        default: 0,
    },
    repoIds: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "Repository",
        },
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
productSchema.virtual("imagesUrl").get(function () {
    return this.images.map((image) => `${process.env.APP_URL}/uploads/${image}`);
});
productSchema.pre("save", function (next) {
    if (this.link && this.isModified("link")) {
        const shareableLink = this.link || '';
        const fileIdMatch = shareableLink.match(/\/d\/(.+?)\//);
        if (fileIdMatch && fileIdMatch[1]) {
            const fileId = fileIdMatch[1];
            this.directDownloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
        }
        else {
            this.directDownloadLink = ''; // Handle if pattern is not matched
            // return next(new ApiError(
            //   {
            //     en: "Link not valid",
            //     ar: "الرابط غير صالح",
            //   },
            //   StatusCodes.EXPECTATION_FAILED
            // ));
        }
    }
    next();
});
productSchema.virtual("finalPrice").get(function () {
    return this.priceAfterDiscount || this.priceBeforeDiscount;
});
exports.Product = (0, mongoose_1.model)("Product", productSchema);
