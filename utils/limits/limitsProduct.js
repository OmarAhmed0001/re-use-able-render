"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitedForProduct = void 0;
const product = {
    product: { limit: 7000 }
};
const limitedForProduct = () => {
    return product.product.limit;
};
exports.limitedForProduct = limitedForProduct;
