"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
const contactSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    contactType: {
        type: String,
        enum: ["complaints", "suggestions", "customerService"],
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isOpened: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Contact = (0, mongoose_1.model)("Contact", contactSchema);
