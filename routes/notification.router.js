"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const protected_middleware_1 = require("../middlewares/protected.middleware");
const notification_validator_1 = require("../validations/notification.validator");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRoute = (0, express_1.Router)();
notificationRoute
    .route("/")
    .get(protected_middleware_1.protectedMiddleware, notification_controller_1.getAllNotifications)
    .post(protected_middleware_1.protectedMiddleware, (0, validation_middleware_1.validate)(notification_validator_1.postNotificationValidation), notification_controller_1.createNotification);
notificationRoute
    .route("/:id")
    .put(protected_middleware_1.protectedMiddleware, (0, validation_middleware_1.validate)(notification_validator_1.putNotificationValidation), notification_controller_1.updateNotification)
    .delete(protected_middleware_1.protectedMiddleware, notification_controller_1.deleteNotification);
notificationRoute
    .route("/read/:id")
    .put(protected_middleware_1.protectedMiddleware, (0, validation_middleware_1.validate)(notification_validator_1.putNotificationValidation), notification_controller_1.markNotificationAsRead);
notificationRoute
    .route("/all")
    .post(protected_middleware_1.protectedMiddleware, notification_controller_1.createNotificationAll)
    .get(protected_middleware_1.protectedMiddleware, notification_controller_1.getAllNotificationsByUser);
notificationRoute
    .route("/unread")
    .get(protected_middleware_1.protectedMiddleware, notification_controller_1.getUnreadNotificationsByUser);
exports.default = notificationRoute;
