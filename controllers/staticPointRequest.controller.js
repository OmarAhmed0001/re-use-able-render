"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectUserRequestToGrantPoints = exports.AcceptUserRequestToGrantPoints = exports.insertUserPointRequest = exports.getAllStaticPoints = void 0;
const staticPointRequest_model_1 = require("../models/staticPointRequest.model");
const pointsManagement_controller_1 = require("./pointsManagement.controller");
const user_model_1 = require("../models/user.model");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cart_model_1 = require("../models/cart.model");
const getAllStaticPoints = async (req, res) => {
    const staticPoints = await staticPointRequest_model_1.StaticPoints.find({});
    if (staticPoints.length > 0) {
        return res.status(200).send({ message_en: "success", data: staticPoints });
    }
    return res
        .status(400)
        .send({
        error_en: "Points are Not Found",
        error_ar: "لم يتم العثور على النقاط",
    });
};
exports.getAllStaticPoints = getAllStaticPoints;
const insertUserPointRequest = async (req, res) => {
    const { user, pointsManagement } = req.body;
    // // what should be in the body of the user ,
    let deductedAmount = (0, pointsManagement_controller_1.processUserPointAndTurnintoCurrency)(Math.min(pointsManagement === null || pointsManagement === void 0 ? void 0 : pointsManagement.max, user === null || user === void 0 ? void 0 : user.points), pointsManagement === null || pointsManagement === void 0 ? void 0 : pointsManagement.totalPointConversionForOneUnit);
    // const isExist=await StaticPoints.findOne({name:user?.name})
    const pointRequest = new staticPointRequest_model_1.StaticPoints({
        name: user === null || user === void 0 ? void 0 : user.name,
        points: Math.min(user === null || user === void 0 ? void 0 : user.points, pointsManagement === null || pointsManagement === void 0 ? void 0 : pointsManagement.max),
        pointsValue: deductedAmount,
        status: "initiated",
        user: user === null || user === void 0 ? void 0 : user._id,
    });
    await pointRequest.save();
    return res
        .status(200)
        .send({
        message_en: "your Request is Sent to The Admin , and He Will Process it in no Time",
        message_ar: "تم إرسال طلبك إلى المسؤول وسيتم معالجته في أسرع وقت ممكن",
    });
    // first  i need the user Id to get his name , and his points ,
    // then i need to calcuate how many money will be deducted wither maximum or not
    // then insert the request ,
    //    console.log('What is the body of the static request ',req.body)
};
exports.insertUserPointRequest = insertUserPointRequest;
exports.AcceptUserRequestToGrantPoints = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const isRequestExist = await staticPointRequest_model_1.StaticPoints.findById(id);
    if (!isRequestExist)
        return res
            .status(400)
            .send({
            error_en: "No Such REquest Exist; ",
            error_ar: "أعتذر ، لكن لا يوجد مثل هذا الطلب في نظامنا",
        });
    try {
        const isCartUpdated = await cart_model_1.Cart.findOneAndUpdate({ user: isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.user }, {
            $inc: { totalCartPrice: -(isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.pointsValue) },
            $set: { isPointsUsed: true },
        }, { new: true });
        console.log("What is the :Value of the user Points: ", Number(isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.points), isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.user);
        if (!isCartUpdated)
            return res
                .status(400)
                .send({
                error_en: "Cart Can't Be Updated: ",
                error_ar: "Cart Can't Be Updated: ",
            });
        else {
            const isUserUpdated = await user_model_1.User.findByIdAndUpdate(isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.user, { $inc: { points: -Number(isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.points) } });
            if (!isUserUpdated)
                return res
                    .status(400)
                    .send({
                    error_en: "User Data can't be updated: ",
                    error_ar: "لا يمكن تحديث بيانات المستخدم",
                });
            await staticPointRequest_model_1.StaticPoints.findByIdAndDelete(id);
            return res
                .status(200)
                .send({
                message_en: "You Accept The user Request and User Data And His Cart Updated Successfully",
                message_ar: "تم قبول طلب المستخدم وبيانات المستخدم وتم تحديث سلة التسوق الخاصة به بنجاح  ",
            });
        }
    }
    catch (e) {
        console.log("error: ", e.message);
        return res
            .status(500)
            .send({
            error_en: `The Error is : ${e.message}`,
            error_ar: `${e.message}`,
        });
    }
    // by the id of the request i will first get how many points get converted to 1 nuit currency
    // then update the cart total price and after that will deduct the point from the client it self
    // response to the admin with status success of granting the user point
});
exports.rejectUserRequestToGrantPoints = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const isRejected = await staticPointRequest_model_1.StaticPoints.findByIdAndDelete(id);
    if (!isRejected)
        return res
            .status(400)
            .send({
            error_en: "You Cant Reject the User Request Be Cause its Not Found",
            error_ar: "لا يمكنك رفض طلب المستخدم لأنه غير موجود",
        });
    return res
        .status(200)
        .send({
        message_en: "You Rejected User Request",
        message_ar: "لقد رفضت طلب المستخدم",
    });
});
