"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const section_validator_1 = require("../validations/section.validator");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const section_controller_1 = require("./../controllers/section.controller");
const sectionRouter = (0, express_1.Router)();
sectionRouter
    .route("/")
    .get(section_controller_1.getAllSections)
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(section_validator_1.sectionValidator), section_controller_1.createSection);
sectionRouter.route('/sectionName/:sectionName').get(section_controller_1.getSectionByName);
sectionRouter
    .route("/:id")
    .get(section_controller_1.getSectionById)
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(section_validator_1.sectionValidator), section_controller_1.updateSection)
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), section_controller_1.deleteSection);
exports.default = sectionRouter;
