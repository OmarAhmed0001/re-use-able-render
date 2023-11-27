"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const repository_controller_1 = require("../controllers/repository.controller");
const repository_validator_1 = require("../validations/repository.validator");
const repositoryRouter = (0, express_1.Router)();
repositoryRouter
    .route("/")
    .get(repository_controller_1.getAllRepositories)
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(repository_validator_1.postRepositoryValidation), repository_controller_1.createRepository); //admin root admina adminb
repositoryRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), (0, validation_middleware_1.validate)(repository_validator_1.putRepositoryValidation), repository_controller_1.getRepositoryById) //admin root admina adminb adminc subadmin
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(repository_validator_1.putRepositoryValidation), repository_controller_1.updateRepository) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), repository_controller_1.deleteRepository); //admin root admina adminb
repositoryRouter.route("/:id/add-product").post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), 
// validate(postRepositoryValidation),
repository_controller_1.addProductToRepository); //admin root admina adminb
repositoryRouter
    .route("/:id/products/:productId")
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), 
// validate(putRepositoryValidation),
repository_controller_1.updateProductInRepository) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), 
// validate(postRepositoryValidation),
repository_controller_1.deleteProductFromRepository); //admin root admina adminb
repositoryRouter
    .route("/allProduct/:id")
    .get(repository_controller_1.getAllRepositoriesForAllProducts); //admin root admina adminb
exports.default = repositoryRouter;
