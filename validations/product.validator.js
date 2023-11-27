"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putProductValidation = exports.postProductValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const productValidator = joi_1.default.object({
    title_en: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    title_ar: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    description_en: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    description_ar: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    priceBeforeDiscount: joi_1.default.number()
        .min(1)
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    priceAfterDiscount: joi_1.default.number()
        .min(0)
        .max(joi_1.default.ref("priceBeforeDiscount"))
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    quantity: joi_1.default.number().min(0).optional(),
    images: joi_1.default.array()
        .items(joi_1.default.string())
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    paymentType: joi_1.default.string()
        .valid("online", "cash")
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    keywords: joi_1.default.array().items(joi_1.default.string()),
    attributes: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        key_ar: joi_1.default.string().required(),
        key_en: joi_1.default.string().required(),
        values: joi_1.default.array()
            .min(1)
            .items(joi_1.default.object({
            value_ar: joi_1.default.string().required(),
            value_en: joi_1.default.string().required(),
        }))
            .required(),
    }))
        .optional(),
    qualities: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        key_ar: joi_1.default.string().required(),
        key_en: joi_1.default.string().required(),
        values: joi_1.default.array()
            .min(1)
            .items(joi_1.default.object({
            value_ar: joi_1.default.string().required(),
            value_en: joi_1.default.string().required(),
            price: joi_1.default.number().required(),
        }))
            .required(),
    }))
        .optional(),
    qualitiesImages: joi_1.default.array()
        .min(1)
        .items(joi_1.default.object({
        image: joi_1.default.string().required(),
        qualities: joi_1.default.array()
            .min(1)
            .items(joi_1.default.object({
            key_ar: joi_1.default.string().required(),
            key_en: joi_1.default.string().required(),
            value_ar: joi_1.default.string().required(),
            value_en: joi_1.default.string().required(),
        }))
            .required(),
    }))
        .optional(),
    category: joi_1.default.string()
        .hex()
        .length(24)
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    subCategory: joi_1.default.string()
        .hex()
        .length(24)
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    deliveryType: joi_1.default.string().alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    weight: joi_1.default.number()
        .min(1)
        .alter({
        post: (schema) => schema.required(),
        put: (schema) => schema.optional(),
    }),
    title_meta: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    desc_meta: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    title: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    message: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    receiver: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    role: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    link: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    extention: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    directDownloadLink: joi_1.default.string().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    repoQuantity: joi_1.default.number().alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
    repoIds: joi_1.default.array()
        .items(joi_1.default.string().hex().length(24))
        .alter({
        post: (schema) => schema.optional(),
        put: (schema) => schema.optional(),
    }),
});
exports.postProductValidation = productValidator.tailor("post");
exports.putProductValidation = productValidator.tailor("put");
