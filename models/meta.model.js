"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meta = void 0;
const mongoose_1 = require("mongoose");
const metaSchema = new mongoose_1.Schema({
    title_meta: {
        type: String,
        required: true,
    },
    desc_meta: {
        type: String,
        required: true,
    },
    reference: {
        type: mongoose_1.Types.ObjectId,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.Meta = (0, mongoose_1.model)("Meta", metaSchema);
