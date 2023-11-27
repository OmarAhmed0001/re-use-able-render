"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const history_controller_1 = require("../controllers/history.controller");
const historyRouter = (0, express_1.Router)();
historyRouter
    .route("/getUserEachDay")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), history_controller_1.getUserEachDay); //admin root admina adminb adminc subadmin
historyRouter
    .route("/getGuestUserEachDay")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), history_controller_1.getGuestUserEachDay); //admin root admina adminb adminc subadmin
historyRouter
    .route("/getOrdersEachDayAndTotalMoney")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), history_controller_1.getOrdersEachDayAndTotalMoney); //admin root admina adminb adminc subadmin
historyRouter
    .route("/getAllStatusDetails")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), history_controller_1.getAllStatusDetails); //admin root admina adminb adminc subadmin
historyRouter
    .route("/getOrdersEachMonth")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), history_controller_1.getOrdersEachMonth); //admin root admina adminb adminc subadmin
historyRouter
    .route("/getAllVisitorsLocation")
    .get(protected_middleware_1.protectedMiddleware, 
// allowedTo(
//   Role.RootAdmin,
//   Role.AdminA,
//   Role.AdminB,
//   Role.AdminB,
//   Role.AdminC,
//   Role.SubAdmin
// ),
history_controller_1.getAllVisitorsHistory);
exports.default = historyRouter;
