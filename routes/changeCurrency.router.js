"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import { validate } from "../middlewares/validation.middleware";
const protected_middleware_1 = require("../middlewares/protected.middleware");
// import {
// } from "../validations/changeCurrency.validator";
const changeCurrency_controller_1 = require("../controllers/changeCurrency.controller");
const changeCurrencyRoute = (0, express_1.Router)();
changeCurrencyRoute
    .route("/")
    .post(protected_middleware_1.protectedMiddleware, /*validate(userRegisterValidation),*/ changeCurrency_controller_1.ExchangeRate)
    .get(protected_middleware_1.protectedMiddleware, /*validate(userRegisterValidation),*/ changeCurrency_controller_1.getExchangeRate);
exports.default = changeCurrencyRoute;
