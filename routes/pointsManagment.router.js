"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pointsManagement_controller_1 = require("../controllers/pointsManagement.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const PointsMangement_validator_1 = require("../validations/PointsMangement.validator");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const PointsManagementsRouter = (0, express_1.Router)();
PointsManagementsRouter.route('/grantPoints').post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), pointsManagement_controller_1.grantUserPointsBasedOnByAdminPermissionOrDynamic);
PointsManagementsRouter
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, pointsManagement_controller_1.getAllPointsManagements)
    .post((0, validation_middleware_1.validate)(PointsMangement_validator_1.postPointsManagementValidation), pointsManagement_controller_1.createPointsManagement);
exports.default = PointsManagementsRouter;
