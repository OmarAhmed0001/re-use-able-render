"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategory = void 0;
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    image: { type: String, default: "" },
    productsCount: { type: Number, default: 0 },
    category: {
        type: mongoose_1.Types.ObjectId,
        ref: "Category",
        required: [true, "SubCategory Must Be Belong To Parent Category"],
    },
    metaDataId: { type: mongoose_1.Types.ObjectId, ref: "Meta" },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
subCategorySchema.virtual("imageUrl").get(function () {
    if (this.image) {
        return `${process.env.APP_URL}/uploads/${this.image}`;
    }
    return ``;
});
exports.SubCategory = (0, mongoose_1.model)("SubCategory", subCategorySchema);
