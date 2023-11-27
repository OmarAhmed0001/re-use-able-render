"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const category_validator_1 = require("../validations/category.validator");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const category_controller_1 = require("../controllers/category.controller");
const categoryRouter = (0, express_1.Router)();
categoryRouter
    .route("/getAllCategoriesWithProducts")
    .get(category_controller_1.getAllCategoriesWithProducts); //all
categoryRouter
    .route("/getAllCategoriesWithSubCategories")
    .get(category_controller_1.getAllCategoriesWithSubCategories); //all
categoryRouter
    .route("/")
    .get(category_controller_1.getAllCategories) //all
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(category_validator_1.postCategoryValidation), category_controller_1.createCategory); //admin root admina adminb
categoryRouter
    .route("/:id")
    .get(category_controller_1.getCategoryById) //all
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(category_validator_1.putCategoryValidation), category_controller_1.updateCategory) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), category_controller_1.deleteCategory); //admin root admina adminb
exports.default = categoryRouter;
// done
