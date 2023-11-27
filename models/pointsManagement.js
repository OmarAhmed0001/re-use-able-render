"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PointsMangementSchema = new mongoose_1.Schema({
    noOfPointsInOneUnit: Number,
    totalPointConversionForOneUnit: Number,
    min: Number,
    max: Number,
    status: { type: String, default: 'static' }
});
const PointsManagement = (0, mongoose_1.model)('points', PointsMangementSchema);
exports.default = PointsManagement;
