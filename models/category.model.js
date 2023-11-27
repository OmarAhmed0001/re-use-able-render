"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    revinue: { type: Number, default: 0 },
    subCategoriesCount: { type: Number, default: 0 },
    productsCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
    metaDataId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Meta" },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
categorySchema.virtual("imageUrl").get(function () {
    if (this.image) {
        return `${process.env.APP_URL}/uploads/${this.image}`;
    }
    return ``;
});
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
