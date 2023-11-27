"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const favorite_controller_1 = require("../controllers/favorite.controller");
const favouriteRouter = (0, express_1.Router)();
favouriteRouter
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), favorite_controller_1.getFavouriteList) // user
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), favorite_controller_1.addProductToFavouritesList); // user
favouriteRouter
    .route("/:productId")
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), favorite_controller_1.removeProductFromFavouritesList); // user
favouriteRouter
    .route("/toggleItemToFavourites/:productId")
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), favorite_controller_1.toggleProductFromFavouritesList); // user
favouriteRouter
    .route("/getAllProducts")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), favorite_controller_1.getAllItemsFromAllFavouritesList); //admin root admina adminb adminc subadmin
exports.default = favouriteRouter;
