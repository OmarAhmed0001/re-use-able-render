"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUpdateVisitorHistory = void 0;
const visitorHistory_model_1 = require("../models/visitorHistory.model");
const ApiError_1 = __importDefault(require("./ApiError"));
const http_status_codes_1 = require("http-status-codes");
const createAndUpdateVisitorHistory = async (country, ip) => {
    try {
        // Input validation
        if (!country || !ip) {
            throw new ApiError_1.default({
                en: "Country or IP is missing",
                ar: "IP لم تدخل البلد أو ",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        // Check if the IP already exists in the IP array for the given country
        const existingRecord = await visitorHistory_model_1.VisitorHistory.findOne({ country, "ip": ip });
        if (!existingRecord) {
            // IP doesn't exist, create a new record
            const updatedVisitorHistory = await visitorHistory_model_1.VisitorHistory.findOneAndUpdate({ country }, {
                $inc: { count: 1 },
                $addToSet: { ip: ip },
            }, { upsert: true, new: true } // Upsert ensures a new record is created if not found
            );
            return updatedVisitorHistory;
        }
        else {
            // IP already exists, do not update the record
            return existingRecord;
        }
    }
    catch (error) {
        // Handle errors and return an ApiError
        return new ApiError_1.default({
            en: "Failed to create/update IP history",
            ar: "فشل في إنشاء / تحديث سجل الآيبي",
        }, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
exports.createAndUpdateVisitorHistory = createAndUpdateVisitorHistory;
