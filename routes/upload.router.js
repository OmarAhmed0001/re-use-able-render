"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const uploadRouter = (0, express_1.Router)();
uploadRouter
    .route("/image?")
    .post(protected_middleware_1.protectedMiddleware, upload_middleware_1.uploadMemory.single("image"), upload_controller_1.uploadImage);
uploadRouter
    .route("/file")
    .post(protected_middleware_1.protectedMiddleware, upload_middleware_1.uploadDisk.single("file"), upload_controller_1.uploadFile);
uploadRouter
    .route("/files")
    .post(protected_middleware_1.protectedMiddleware, upload_middleware_1.uploadDisk.array("files"), upload_controller_1.uploadFiles);
exports.default = uploadRouter;
