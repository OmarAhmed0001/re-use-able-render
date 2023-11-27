"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const mongoose_1 = require("mongoose");
const attributeSchema = new mongoose_1.Schema({
    key_ar: {
        type: String,
        required: true,
    },
    key_en: {
        type: String,
        required: true,
    },
    values: {
        type: [
            {
                value_ar: { type: String, required: true },
                value_en: { type: String, required: true },
            },
        ],
        required: true,
        validate: { validator: (v) => Array.isArray(v) && v.length > 0 },
    },
});
exports.Attribute = (0, mongoose_1.model)("Attribute", attributeSchema);
