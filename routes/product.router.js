"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const product_controller_1 = require("../controllers/product.controller");
const product_validator_1 = require("../validations/product.validator");
const productRouter = (0, express_1.Router)();
// TODO: add the rest of the roles
productRouter
    .route("/")
    .get(product_controller_1.getAllProducts) //all
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(product_validator_1.postProductValidation), product_controller_1.createProduct); //admin root admina adminb
productRouter
    .route("/forSpecificCategory/:categoryId")
    .get(product_controller_1.getAllProductsByCategoryId); //all
productRouter
    .route("/:id")
    .get(product_controller_1.getProductById) //all
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(product_validator_1.putProductValidation), product_controller_1.updateProduct) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), product_controller_1.deleteProduct); //admin root admina adminb
productRouter
    .route("/toggleLike/:productId")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), product_controller_1.toggleLikeBySomeOneById); //user
exports.default = productRouter;
