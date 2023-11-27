"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitedForSubCategory = void 0;
const subcategory = {
    subcategory: { limit: 10 }
};
const limitedForSubCategory = () => {
    return subcategory.subcategory.limit;
};
exports.limitedForSubCategory = limitedForSubCategory;
