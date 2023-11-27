"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorHistory = void 0;
const mongoose_1 = require("mongoose");
const VisitorHistorySchema = new mongoose_1.Schema({
    count: { type: Number, required: true },
    country: { type: String, required: true },
    ip: { type: [{ type: String, required: true }], required: true },
});
exports.VisitorHistory = (0, mongoose_1.model)("VisitorHistory", VisitorHistorySchema);
