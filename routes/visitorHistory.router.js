"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const visitorHistory_controller_1 = require("../controllers/visitorHistory.controller");
const visitorHistory_validator_1 = require("../validations/visitorHistory.validator");
const visitorHistoryRouter = (0, express_1.Router)();
visitorHistoryRouter
    .route("/")
    .get(visitorHistory_controller_1.getAllVisitorsHistory)
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(visitorHistory_validator_1.postVisitorHistoryValidation), visitorHistory_controller_1.createVisitorHistory); //admin root admina adminb
visitorHistoryRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), (0, validation_middleware_1.validate)(visitorHistory_validator_1.putVisitorHistoryValidation), visitorHistory_controller_1.getVisitorHistoryById) //admin root admina adminb adminc subadmin
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(visitorHistory_validator_1.putVisitorHistoryValidation), visitorHistory_controller_1.updateVisitorHistory) //admin root admina adminb
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), visitorHistory_controller_1.deleteVisitorHistory); //admin root admina adminb
exports.default = visitorHistoryRouter;
