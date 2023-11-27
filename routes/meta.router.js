"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const meta_controller_1 = require("../controllers/meta.controller");
const meta_validator_1 = require("../validations/meta.validator");
const metaRouter = (0, express_1.Router)();
metaRouter
    .route("/")
    .get(
// protectedMiddleware,
meta_controller_1.getAllMetas);
metaRouter
    .route("/:id")
    .get(
// protectedMiddleware,
(0, validation_middleware_1.validate)(meta_validator_1.MetaValidation), meta_controller_1.getMetaById) //admin root admina adminb adminc subadmin
    .put(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), (0, validation_middleware_1.validate)(meta_validator_1.MetaValidation), meta_controller_1.updateMeta); //admin root admina adminb
metaRouter.route('/getByReference/:id').get(meta_controller_1.getMetaByRefrence);
exports.default = metaRouter;
