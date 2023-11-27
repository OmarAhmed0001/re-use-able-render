"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const attribute_controller_1 = require("../controllers/attribute.controller");
const attribute_validator_1 = require("../validations/attribute.validator");
const attributeRouter = (0, express_1.Router)();
attributeRouter
    .route("/")
    .get(attribute_controller_1.getAllAttributes)
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(attribute_validator_1.postAttributeValidation), attribute_controller_1.createAttribute); //admin root admina adminb
attributeRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), (0, validation_middleware_1.validate)(attribute_validator_1.putAttributeValidation), attribute_controller_1.getAttributeById) //admin root admina adminb adminc subadmin
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(attribute_validator_1.putAttributeValidation), attribute_controller_1.updateAttribute) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), attribute_controller_1.deleteAttribute); //admin root admina adminb
exports.default = attributeRouter;
