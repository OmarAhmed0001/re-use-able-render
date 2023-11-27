"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisitorHistory = exports.updateVisitorHistory = exports.createVisitorHistory = exports.getVisitorHistoryById = exports.getAllVisitorsHistory = void 0;
const factory_controller_1 = require("./factory.controller");
const visitorHistory_model_1 = require("../models/visitorHistory.model");
// @desc    Get All VisitorHistory
// @route   POST /api/v1/visitorHistory
// @access  Private (Admin)
exports.getAllVisitorsHistory = (0, factory_controller_1.getAllItems)(visitorHistory_model_1.VisitorHistory);
// @desc    Get Specific VisitorHistory By Id
// @route   POST /api/v1/VisitorHistory/:id
// @access  Private (Admin)
exports.getVisitorHistoryById = (0, factory_controller_1.getOneItemById)(visitorHistory_model_1.VisitorHistory);
// @desc    Create New VisitorHistory
// @route   POST /api/v1/VisitorHistory
// @access  Private (Admin)
exports.createVisitorHistory = (0, factory_controller_1.createNewItem)(visitorHistory_model_1.VisitorHistory);
// @desc    Update VisitorHistory By Id
// @route   POST /api/v1/VisitorHistory/:id
// @access  Private (Admin)
exports.updateVisitorHistory = (0, factory_controller_1.updateOneItemById)(visitorHistory_model_1.VisitorHistory);
// @desc    Delete VisitorHistory By Id
// @route   POST /api/v1/VisitorHistory/:id
// @access  Private (Admin)
exports.deleteVisitorHistory = (0, factory_controller_1.deleteOneItemById)(visitorHistory_model_1.VisitorHistory);
