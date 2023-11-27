"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipAddressMiddleware = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.ipAddressMiddleware = (0, express_async_handler_1.default)(async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    req.ipAddress = ip;
    console.log("ipAddress: ", ip);
    next();
});
