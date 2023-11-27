"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMessage = exports.deleteMessage = exports.createMessage = exports.getMessageById = exports.getAllMessages = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const contact_model_1 = require("../models/contact.model");
const factory_controller_1 = require("./factory.controller");
// @desc    Get All Messages
// @route   GET /api/v1/contacts
// @access  Private (Admins)
exports.getAllMessages = (0, factory_controller_1.getAllItems)(contact_model_1.Contact);
// @desc    Get Message By Id
// @route   GET /api/v1/contacts/:id
// @access  Private (Admins)
exports.getMessageById = (0, factory_controller_1.getOneItemById)(contact_model_1.Contact);
// @desc    Create New Message
// @route   POST /api/v1/contacts
// @access  Private (Users)
exports.createMessage = (0, factory_controller_1.createNewItem)(contact_model_1.Contact);
// @desc    Delete Message By Id
// @route   DELETE /api/v1/contacts/:id
// @access  Private (Admins)
exports.deleteMessage = (0, factory_controller_1.deleteOneItemById)(contact_model_1.Contact);
// @desc    Toggle Message To Opened It
// @route   DELETE /api/v1/contacts/:id
// @access  Private (Admins)
exports.toggleMessage = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // update isopend to true
    const contact = await contact_model_1.Contact.findByIdAndUpdate({ _id: id }, { isOpened: true }, { new: true });
    res.status(200).json({
        status: "success",
        data: contact,
        success_en: "updated successfully",
        success_ar: "تم التحديث بنجاح",
    });
});
