"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const analyticsMeta_controller_1 = require("../controllers/analyticsMeta.controller");
const analyticsMeta_model_1 = require("../models/analyticsMeta.model");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const AnalyticsMetaRouter = (0, express_1.Router)();
AnalyticsMetaRouter
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, analyticsMeta_controller_1.getAllAnalyticsMeta).post((0, validation_middleware_1.validate)(analyticsMeta_model_1.postAnalyticsMetaValidator), analyticsMeta_controller_1.createAnalyticsMeta);
AnalyticsMetaRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, analyticsMeta_controller_1.getAnalyticsMeta).delete(analyticsMeta_controller_1.deleteAnalyticsMeta); //admin root admina adminb adminc subadmin
exports.default = AnalyticsMetaRouter;
