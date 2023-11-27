"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = exports.getAttributeById = exports.getAllAttributes = void 0;
const factory_controller_1 = require("./factory.controller");
const attribute_model_1 = require("../models/attribute.model");
// @desc    Get All Attributes
// @route   POST /api/v1/attributes
// @access  Private (Admin)
exports.getAllAttributes = (0, factory_controller_1.getAllItems)(attribute_model_1.Attribute);
// @desc    Get Specific Attribute By Id
// @route   POST /api/v1/attributes/:id
// @access  Private (Admin)
exports.getAttributeById = (0, factory_controller_1.getOneItemById)(attribute_model_1.Attribute);
// @desc    Create New Attribute
// @route   POST /api/v1/attributes
// @access  Private (Admin)
// export const createAttribute = createNewItem(Attribute);
exports.createAttribute = (0, factory_controller_1.createNewItem)(attribute_model_1.Attribute);
// @desc    Update Attribute By Id
// @route   POST /api/v1/attributes/:id
// @access  Private (Admin)
exports.updateAttribute = (0, factory_controller_1.updateOneItemById)(attribute_model_1.Attribute);
// @desc    Delete Attribute By Id
// @route   POST /api/v1/attributes/:id
// @access  Private (Admin)
exports.deleteAttribute = (0, factory_controller_1.deleteOneItemById)(attribute_model_1.Attribute);
