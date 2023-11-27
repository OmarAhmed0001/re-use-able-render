"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.uploadFile = exports.uploadImage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const upload_interface_1 = require("../interfaces/upload/upload.interface");
const sharp_1 = __importDefault(require("sharp"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
// @desc    Upload Image
// @route   POST /api/v1/upload/image
// @access  public (Admin)
exports.uploadImage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { w, h, type = upload_interface_1.IImageType.PNG, quality = 90 } = req.query;
    const { buffer } = req === null || req === void 0 ? void 0 : req.file;
    // check if the type is valid
    if (!Object.values(upload_interface_1.IImageType).includes(type)) {
        return next(new Error("Invalid image type"));
    }
    const baseImage = w && h ? (0, sharp_1.default)(buffer).resize(+w, +h) : (0, sharp_1.default)(buffer);
    const filename = `${Date.now()}-${Math.random()}-quality-${quality}`;
    switch (type) {
        case "jpeg":
            await baseImage
                .toFormat(`jpeg`)
                .jpeg({ quality: +quality })
                .toFile(`./uploads/${filename}.jpeg`);
            break;
        case "jpg":
            await baseImage
                .toFormat(`jpg`)
                .jpeg({ quality: +quality })
                .toFile(`./uploads/${filename}.jpg`);
            break;
        case "gif":
            await baseImage.toFormat(`gif`).toFile(`./uploads/${filename}.gif`);
            break;
        case "webp":
            await baseImage
                .toFormat(`webp`)
                .webp({ quality: +quality })
                .toFile(`./uploads/${filename}.webp`);
            break;
        case "svg":
            await baseImage.toFormat(`svg`).toFile(`./uploads/${filename}.svg`);
            break;
        default:
            await baseImage
                .toFormat(`png`)
                .png({ quality: +quality })
                .toFile(`./uploads/${filename}.png`);
    }
    const imageUrl = `${process.env.APP_URL}/uploads/${filename}.${type}`;
    const image = `${filename}.${type}`;
    res.status(200).json({ imageUrl, image });
});
// @desc    Upload File
// @route   POST /api/v1/upload/file
// @access  public (Admin)
exports.uploadFile = (0, express_async_handler_1.default)(async (req, res, next) => {
    res.status(200).json({ fileUrl: req.body.fileUrl, file: req.body.file });
});
// @desc    Upload Files
// @route   POST /api/v1/upload/files
// @access  public (Admin)
exports.uploadFiles = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    if (!req.files) {
        return next(new ApiError_1.default({ ar: "لم يتم اختيار الملفات", en: "No files selected" }, 400));
    }
    const files = (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file === null || file === void 0 ? void 0 : file.filename);
    res.status(200).json({ files });
});
