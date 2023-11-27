"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const subCategory_validator_1 = require("../validations/subCategory.validator");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const subCategory_controller_1 = require("../controllers/subCategory.controller");
const subCategoriesRouter = (0, express_1.Router)();
subCategoriesRouter
    .route("/")
    .get(subCategory_controller_1.getAllSubCategories) //all
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(subCategory_validator_1.postSubCategoryValidation), subCategory_controller_1.createSubCategory); //admin root admina adminb
subCategoriesRouter
    .route("/:id")
    .get(subCategory_controller_1.getSubCategoryById) //all
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(subCategory_validator_1.putSubCategoryValidation), subCategory_controller_1.updateSubCategoryById) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), subCategory_controller_1.deleteSubCategoryById); //admin root admina adminb
subCategoriesRouter
    .route("/forSpecificCategory/:categoryId")
    .get(subCategory_controller_1.getAllSubCategoriesByCategoryId); //all
exports.default = subCategoriesRouter;
