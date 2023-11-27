"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticPoints = void 0;
const mongoose_1 = require("mongoose");
const staticPointSchema = new mongoose_1.Schema({
    name: String,
    points: Number,
    pointsValue: Number,
    status: { type: String, enum: ['initiated'] },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.StaticPoints = (0, mongoose_1.model)("StaticPoints", staticPointSchema);
