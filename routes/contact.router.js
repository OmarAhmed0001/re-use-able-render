"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const user_interface_1 = require("../interfaces/user/user.interface");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const contact_validator_1 = require("../validations/contact.validator");
const contactRouter = (0, express_1.Router)();
contactRouter
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), contact_controller_1.getAllMessages) //admin root admina adminb adminc subadmin
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(contact_validator_1.postContactValidation), contact_controller_1.createMessage); //user
contactRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), contact_controller_1.getMessageById) //admin root admina adminb adminc subadmin
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), contact_controller_1.deleteMessage); //admin root admina adminb subadmin
contactRouter
    .route("/OpendMessage/:id")
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.SubAdmin), contact_controller_1.toggleMessage); // subadmin
exports.default = contactRouter;
