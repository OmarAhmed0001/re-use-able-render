"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const sendNewsViaEmailAndSMS_controller_1 = require("../controllers/sendNewsViaEmailAndSMS.controller");
const sendNewsViaEmailAndSMS_validator_1 = require("../validations/sendNewsViaEmailAndSMS.validator");
const sendNewsViaEmailAndSMSRouter = (0, express_1.Router)();
sendNewsViaEmailAndSMSRouter
    .route("/viaEmail")
    .post(protected_middleware_1.protectedMiddleware, (0, validation_middleware_1.validate)(sendNewsViaEmailAndSMS_validator_1.sendNewsViaEmailValidator), (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), sendNewsViaEmailAndSMS_controller_1.sendNewsViaEmail);
sendNewsViaEmailAndSMSRouter
    .route("/viaSMS")
    .post(protected_middleware_1.protectedMiddleware, (0, validation_middleware_1.validate)(sendNewsViaEmailAndSMS_validator_1.sendNewsViaSMSValidator), (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), sendNewsViaEmailAndSMS_controller_1.sendNewsViaSMS);
exports.default = sendNewsViaEmailAndSMSRouter;
