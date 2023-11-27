"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const mongoose_1 = require("mongoose");
const sectionSchem = new mongoose_1.Schema({
    title_en: {
        type: String,
        default: "",
    },
    title_ar: {
        type: String,
        default: "",
    },
    description_en: {
        type: String,
        default: "",
    },
    description_ar: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ["slider", "banner", "aboutus", "privacy", "usage", "retrieval", "public"],
    },
    alignment: {
        type: String,
        enum: ["horizontal", "vertical"],
        default: "horizontal",
    },
    metaDataId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Meta" },
});
sectionSchem.virtual("imageUrl").get(function () {
    if (this.image) {
        return `${process.env.APP_URL}/uploads/${this.image}`;
    }
    return ``;
});
exports.Section = (0, mongoose_1.model)("Section", sectionSchem);
