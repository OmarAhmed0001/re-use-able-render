"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const cart_controller_1 = require("../controllers/cart.controller");
const cart_validator_1 = require("../validations/cart.validator");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const cart_controller_2 = require("../controllers/cart.controller");
const cartRouter = (0, express_1.Router)();
cartRouter
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER, user_interface_1.Role.Guest), cart_controller_1.getCart); // user
cartRouter
    .route("/deleteByAdmin/:id")
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), cart_controller_1.deleteCart); // Admin 
cartRouter
    .route("/getAllCarts")
    .get(protected_middleware_1.protectedMiddleware, 
// allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB, Role.AdminC, Role.SubAdmin),
cart_controller_1.getAllCarts); // user
cartRouter
    .route("/verify")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), cart_controller_2.verifyCoupon);
cartRouter
    .route("/:productId")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER, user_interface_1.Role.Guest), (0, validation_middleware_1.validate)(cart_validator_1.addToCartValidation), cart_controller_1.addToCart) // user
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER, user_interface_1.Role.Guest), cart_controller_1.deleteCartItem); //user
exports.default = cartRouter;
