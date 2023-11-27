"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitedForCategory = void 0;
const category = {
    category: { limit: 20 }
};
const limitedForCategory = () => {
    return category.category.limit;
};
exports.limitedForCategory = limitedForCategory;
