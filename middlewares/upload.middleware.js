"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDisk = exports.uploadMemory = void 0;
const multer_1 = __importDefault(require("multer"));
const memoryStorage = multer_1.default.memoryStorage();
const diskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const imageExtension = file.mimetype.split("/")[1];
        const filename = `${Date.now()}-${Date.now()}.${imageExtension}`;
        const fileUrl = `${process.env.APP_URL}/uploads/${filename}`;
        req.body.fileUrl = fileUrl;
        req.body.file = filename;
        cb(null, filename);
    },
});
const uploadMemory = (0, multer_1.default)({
    storage: memoryStorage,
});
exports.uploadMemory = uploadMemory;
const uploadDisk = (0, multer_1.default)({
    storage: diskStorage,
    // limits: { fileSize: 1024 * 1024 * 5 },  // 5MB
});
exports.uploadDisk = uploadDisk;
