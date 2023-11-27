"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMetaData = exports.createMetaData = void 0;
const meta_model_1 = require("../models/meta.model");
const createMetaData = async (req, reference) => {
    const { title_meta, desc_meta } = req.body;
    return await meta_model_1.Meta.create({
        title_meta,
        desc_meta,
        reference,
    });
};
exports.createMetaData = createMetaData;
const deleteMetaData = async (reference) => {
    await meta_model_1.Meta.findOneAndDelete({ reference: reference });
    return 1;
};
exports.deleteMetaData = deleteMetaData;
