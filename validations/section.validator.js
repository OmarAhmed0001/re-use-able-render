"use strict";
// import Joi from "joi";
// export const sectionValidator = Joi.object({
//   type: Joi.string().valid(
//     "slider",
//     "banner",
//     "aboutus",
//     "privacy",
//     "usage",
//     "retrieval",
//     "public"
//   ),
//   alignment: Joi.when(Joi.ref("type"), [
//     {
//       is: "banner",
//       then: Joi.string().required(),
//       otherwise: Joi.forbidden(),
//     },
//   ]).valid("horizontal", "vertical"),
//   title_en: Joi.alternatives().conditional("type", [
//     { is: "slider", then: Joi.string().required() },
//     { is: "banner", then: Joi.forbidden() },
//     { is: "aboutus", then: Joi.string().required() },
//     { is: "privacy", then: Joi.string().required() },
//     { is: "usage", then: Joi.string().required() },
//     { is: "retrieval", then: Joi.string().required() },
//     { is: "public", then: Joi.string().required() },
//   ]),
//   title_ar: Joi.alternatives().conditional("type", [
//     { is: "slider", then: Joi.string().required() },
//     { is: "banner", then: Joi.forbidden() },
//     { is: "aboutus", then: Joi.string().required() },
//     { is: "privacy", then: Joi.string().required() },
//     { is: "usage", then: Joi.string().required() },
//     { is: "retrieval", then: Joi.string().required() },
//     { is: "public", then: Joi.string().required() },
//   ]),
//   description_en: Joi.alternatives().conditional("type", [
//     { is: "slider", then: Joi.string().required() },
//     { is: "banner", then: Joi.forbidden() },
//     { is: "aboutus", then: Joi.string().required() },
//     { is: "privacy", then: Joi.string().required() },
//     { is: "usage", then: Joi.string().required() },
//     { is: "retrieval", then: Joi.string().required() },
//     { is: "public", then: Joi.string().required() },
//   ]),
//   description_ar: Joi.alternatives().conditional("type", [
//     { is: "slider", then: Joi.string().required() },
//     { is: "banner", then: Joi.forbidden() },
//     { is: "aboutus", then: Joi.string().required() },
//     { is: "privacy", then: Joi.string().required() },
//     { is: "usage", then: Joi.string().required() },
//     { is: "retrieval", then: Joi.string().required() },
//     { is: "public", then: Joi.string().required() },
//   ]),
//   image: Joi.alternatives().conditional("type", [
//     { is: "slider", then: Joi.string().required() },
//     { is: "banner", then: Joi.string().required() },
//     { is: "aboutus", then: Joi.string().required() },
//     { is: "privacy", then: Joi.forbidden() },
//     { is: "usage", then: Joi.forbidden() },
//     { is: "retrieval", then: Joi.forbidden() },
//     { is: "public", then: Joi.forbidden() },
//   ]),
// });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sectionValidator = joi_1.default.object({
    type: joi_1.default.string().required().valid("slider", "banner", "aboutus", "privacy", "usage", "retrieval", "public"),
    alignment: joi_1.default.when(joi_1.default.ref("type"), {
        is: "banner",
        then: joi_1.default.valid("horizontal", "vertical").required(),
        otherwise: joi_1.default.forbidden(),
    }),
    title_en: customTitleValidation(joi_1.default.ref("type")),
    title_ar: customTitleValidation(joi_1.default.ref("type")),
    description_en: customDescriptionValidation(joi_1.default.ref("type")),
    description_ar: customDescriptionValidation(joi_1.default.ref("type")),
    image: customImageValidation(joi_1.default.ref("type")),
    title_meta: joi_1.default.string().optional(),
    desc_meta: joi_1.default.string().optional(),
});
function customTitleValidation(allowedType) {
    return joi_1.default.when(allowedType, {
        is: "slider",
        then: joi_1.default.string().optional(),
        otherwise: joi_1.default.when(allowedType, {
            is: "banner",
            then: joi_1.default.string().forbidden(),
            otherwise: joi_1.default.string().required(),
        }),
    });
}
function customDescriptionValidation(allowedType) {
    return joi_1.default.when(allowedType, {
        is: "slider",
        then: joi_1.default.string().optional(),
        otherwise: joi_1.default.when(allowedType, {
            is: "banner",
            then: joi_1.default.string().forbidden(),
            otherwise: joi_1.default.string().required(),
        }),
    });
}
function customImageValidation(allowedType) {
    return joi_1.default.when(allowedType, {
        is: "slider",
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.when(allowedType, {
            is: "aboutus",
            then: joi_1.default.string().required(),
            otherwise: joi_1.default.when(allowedType, {
                is: "banner",
                then: joi_1.default.string().required(),
                otherwise: joi_1.default.string().forbidden(),
            }),
        }),
    });
}
