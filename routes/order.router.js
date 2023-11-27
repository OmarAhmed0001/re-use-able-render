"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const allowedTo_middleware_1 = require("../middlewares/allowedTo.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_interface_1 = require("../interfaces/user/user.interface");
const order_controller_1 = require("../controllers/order.controller");
const order_validator_1 = require("../validations/order.validator");
const orderRouter = (0, express_1.Router)();
orderRouter
    .route("/createItemRepository")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), order_controller_1.createItemRepository);
orderRouter
    .route("/")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(order_validator_1.createOrderValidation), order_controller_1.createOrder)
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), order_controller_1.getAllOrders);
orderRouter
    .route("/trackOrder/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin, user_interface_1.Role.USER), order_controller_1.trackOrder);
orderRouter
    .route("/verifyOrder")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), (0, validation_middleware_1.validate)(order_validator_1.verifyOrderValidation), order_controller_1.verifyOrder);
orderRouter
    .route("/shipping/:id")
    .post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), order_controller_1.createShippingOrder);
orderRouter.route("/createOnlineOrder").post(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), order_controller_1.createOnlineOrderInvoice
// validate(createOnlineOrderValidation),
// createOnlineOrder
);
orderRouter
    .route("/myOrders")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER), order_controller_1.getMyOrders);
orderRouter
    .route("/:id")
    .get(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.USER, user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin), order_controller_1.getOrderById)
    // .put(
    //   protectedMiddleware,
    //   validate(changeOrderStatusValidation),
    //   allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    //   updateOrderStatus
    // )
    .delete(protected_middleware_1.protectedMiddleware, (0, allowedTo_middleware_1.allowedTo)(user_interface_1.Role.RootAdmin, user_interface_1.Role.AdminA, user_interface_1.Role.AdminB), order_controller_1.deleteOrder);
exports.default = orderRouter;
