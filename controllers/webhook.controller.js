"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moyasarPaid = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const cart_model_1 = require("../models/cart.model");
const order_model_1 = require("../models/order.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const category_model_1 = require("../models/category.model");
const moyasar_1 = __importDefault(require("../utils/moyasar"));
const sendEmail_1 = require("../utils/mailer/sendEmail");
const pointsManagement_controller_1 = require("./pointsManagement.controller");
exports.moyasarPaid = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { id } = req.body;
    const moyasar = new moyasar_1.default();
    const paymentResult = await moyasar.getPayment(id);
    if ((paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.status) !== "paid") {
        return next(new ApiError_1.default({
            en: "the payment is not paid",
            ar: "الدفع لم يتم",
        }, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    const order = await order_model_1.Order.findOne({
        cartId: (_a = paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.metadata) === null || _a === void 0 ? void 0 : _a.cart_id,
    }).populate([
        { path: "onlineItems.items.product" },
        { path: "cashItems.items.product" },
    ]);
    if (!order) {
        return next(new ApiError_1.default({
            en: "cart not found",
            ar: "السلة غير موجودة",
        }, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    if (paymentResult.amount / 100 !== (order === null || order === void 0 ? void 0 : order.onlineItems.totalPrice)) {
        return next(new ApiError_1.default({
            en: "the payment amount is not equal to the order amount",
            ar: "مبلغ الدفع غير مساوي لمبلغ الطلب",
        }, http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    if (!order || !order.isVerified) {
        return next(new ApiError_1.default({
            en: "Order not found or not verified",
            ar: "الطلب غير موجود او غير مفعل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // change order status to created
    switch (paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.status) {
        case "paid":
            order.status = "created";
            order.payWith.source = paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.source;
            order.payWith.type = (_b = paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.source) === null || _b === void 0 ? void 0 : _b.type;
            order.paymentStatus = "payment_paid";
            order.invoiceId = paymentResult === null || paymentResult === void 0 ? void 0 : paymentResult.id;
            // update product quantity
            const bulkOption = [
                ...order.onlineItems.items,
                ...order.cashItems.items,
            ].map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: {
                        $inc: { sales: +item.quantity, quantity: -item.quantity },
                    },
                },
            }));
            await product_model_1.Product.bulkWrite(bulkOption, {});
            const revenue = order.onlineItems.totalPrice + (((_c = order === null || order === void 0 ? void 0 : order.cashItems) === null || _c === void 0 ? void 0 : _c.totalPrice) || 0);
            // tODO :: before the User Update
            const userPoints = await (0, pointsManagement_controller_1.calculateUserPoints)(order);
            await user_model_1.User.updateOne({ _id: order.user }, { $inc: { revinue: revenue, points: userPoints } });
            await Promise.all([...order.onlineItems.items, ...order.cashItems.items].map(async (item) => {
                const product = await product_model_1.Product.findOne({ _id: item.product });
                await category_model_1.Category.updateOne({ _id: product === null || product === void 0 ? void 0 : product.category }, { $inc: { revinue: item.totalPrice } });
            }));
            await (0, sendEmail_1.sendEmail)(order);
            // delete cart
            // THIS WAS DELETE CART ROLES BUT I STOPED IT
            console.log("What is the Cart: id", order === null || order === void 0 ? void 0 : order.cartId);
            const cart = await cart_model_1.Cart.findByIdAndDelete(order.cartId);
            if (!cart) {
                return next(new ApiError_1.default({
                    en: "cart not found",
                    ar: "السلة غير موجودة",
                }, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
            // find marketer and update points
            if (((_d = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _d === void 0 ? void 0 : _d.couponReference) &&
                ((_e = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _e === void 0 ? void 0 : _e.used) &&
                ((_f = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _f === void 0 ? void 0 : _f.commissionMarketer)) {
                await user_model_1.User.findOneAndUpdate({ couponMarketer: (_g = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _g === void 0 ? void 0 : _g.couponReference.toString() }, {
                    $inc: {
                        totalCommission: Math.floor((_h = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _h === void 0 ? void 0 : _h.commissionMarketer),
                    },
                    $push: {
                        pointsMarketer: {
                            order: order._id,
                            commission: Math.floor((_j = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _j === void 0 ? void 0 : _j.commissionMarketer),
                        },
                    },
                }, { new: true });
            }
            break;
        default:
            // update order paymentStatus
            order.paymentStatus = "payment_failed";
            break;
    }
    await order.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ received: true });
});
