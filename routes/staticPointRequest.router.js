"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const staticPointRequest_controller_1 = require("../controllers/staticPointRequest.controller");
const staticPointsRequestRouter = (0, express_1.Router)();
staticPointsRequestRouter
    .route("/")
    .get(staticPointRequest_controller_1.getAllStaticPoints)
    .post(staticPointRequest_controller_1.insertUserPointRequest);
//   .put()
staticPointsRequestRouter.route("/:id").put(protected_middleware_1.protectedMiddleware, staticPointRequest_controller_1.AcceptUserRequestToGrantPoints)
    .delete(protected_middleware_1.protectedMiddleware, staticPointRequest_controller_1.rejectUserRequestToGrantPoints);
exports.default = staticPointsRequestRouter;
