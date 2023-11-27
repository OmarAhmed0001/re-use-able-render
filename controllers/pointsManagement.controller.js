"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUserPoints = exports.grantUserPointsBasedOnByAdminPermissionOrDynamic = exports.processUserPointAndTurnintoCurrency = exports.getPoinst = exports.createPointsManagement = exports.getAllPointsManagements = void 0;
const pointsManagement_1 = __importDefault(require("../models/pointsManagement"));
const axios_1 = __importDefault(require("axios"));
const user_model_1 = require("../models/user.model");
const cart_model_1 = require("../models/cart.model");
const staticPointRequest_model_1 = require("../models/staticPointRequest.model");
const getAllPointsManagements = async (req, res) => {
    const pointsMangement = await pointsManagement_1.default.findOne();
    if (pointsMangement) {
        // const points = await User.find({ email: { $regex: "user" } })
        return res
            .status(200)
            .send({ message_en: "Success", pointsMangement, data: [] });
    }
    return res.status(400).send({ error_en: "Failed", data: {} });
};
exports.getAllPointsManagements = getAllPointsManagements;
const createPointsManagement = async (req, res) => {
    // check if the same given meta is been created before then update it or else create it
    // await InsertAllDumyUsers();
    const PointsManagementExist = await pointsManagement_1.default.findOne();
    if (PointsManagementExist) {
        const other = await pointsManagement_1.default.findOneAndUpdate({}, Object.assign({}, req.body), { new: true });
        return res.status(200).send({ data: other });
    }
    else {
        const newOther = new pointsManagement_1.default(Object.assign({}, req.body));
        await newOther.save();
        return res.status(200).send({ message_en: "success", data: newOther });
    }
};
exports.createPointsManagement = createPointsManagement;
const getPoinst = async () => {
    let pointsManagement;
    // get the
    if (!pointsManagement) {
        pointsManagement = await pointsManagement_1.default.findOne({});
        // return pointsManagement;
    }
    return pointsManagement;
};
exports.getPoinst = getPoinst;
const processUserPointAndTurnintoCurrency = (userPoints, totalPointConversionForOneUnit) => {
    const THE_TOTAL_MONEY_GRANTED = Math.floor(userPoints / totalPointConversionForOneUnit);
    return THE_TOTAL_MONEY_GRANTED;
};
exports.processUserPointAndTurnintoCurrency = processUserPointAndTurnintoCurrency;
// TODO: Check this logic
const assure_order_is_not_100Percent_free = (total_money_deducted, totalcartPrice) => {
    // it should not be calculated in all cases only if the order would be granted For free
    // so i think i should have also the value of
    const THE_AMOUNT_THAT_IS_NOT_FREE = 0.2;
    const THE_TOTAL_AFTER_DEDUCTION = Math.abs(total_money_deducted - total_money_deducted * THE_AMOUNT_THAT_IS_NOT_FREE);
    const temp = total_money_deducted == totalcartPrice
        ? Math.floor(THE_TOTAL_AFTER_DEDUCTION)
        : Math.floor(total_money_deducted);
    console.log("What is the Number: ", Number(temp));
    return Number(temp);
};
const dynamicallyApplyPointsForSpecificUser = async (user, pointsManagement) => {
    let isDone = false;
    const userCart = await cart_model_1.Cart.findOne({ user: user === null || user === void 0 ? void 0 : user._id }).sort("-createdAt");
    if (userCart === null || userCart === void 0 ? void 0 : userCart.isPointsUsed) {
        // TODO: Refactor this error message to use ApiError
        throw new Error(JSON.stringify({
            error_en: "You Cant Make more than one Request Per Order",
            error_ar: "لا يمكنك تقديم أكثر من طلب واحد لكل طلب",
        }));
    }
    const { max, totalPointConversionForOneUnit } = pointsManagement;
    let tempTotalDedeuctionInCurrency;
    let tempTotalDeductionInPoints;
    tempTotalDedeuctionInCurrency = (0, exports.processUserPointAndTurnintoCurrency)(Math.min(user === null || user === void 0 ? void 0 : user.points, max), totalPointConversionForOneUnit);
    tempTotalDeductionInPoints = Math.floor(Math.abs((user === null || user === void 0 ? void 0 : user.points) - Math.min(user === null || user === void 0 ? void 0 : user.points, max)));
    console.log("What the hell : ", tempTotalDedeuctionInCurrency, tempTotalDeductionInPoints);
    console.log(`What i Should ensure: `.bgRed, assure_order_is_not_100Percent_free(tempTotalDedeuctionInCurrency, userCart === null || userCart === void 0 ? void 0 : userCart.totalCartPrice));
    const no_free_perncentage = assure_order_is_not_100Percent_free(tempTotalDedeuctionInCurrency, userCart === null || userCart === void 0 ? void 0 : userCart.totalCartPrice);
    if (tempTotalDedeuctionInCurrency >= (userCart === null || userCart === void 0 ? void 0 : userCart.totalCartPrice)) {
        throw new Error(JSON.stringify({
            error_en: "This Order is To Low to Request Points For",
            error_ar: "هذا الطلب منخفض جدًا لطلب النقاط.",
        }));
    }
    if ((userCart === null || userCart === void 0 ? void 0 : userCart.totalCartPrice) - no_free_perncentage <= 0)
        throw new Error(JSON.stringify({
            error_en: "This Order is To Low to Request Points For",
            error_ar: "هذا الطلب منخفض جدًا لطلب النقاط.",
        }));
    cart_model_1.Cart.findByIdAndUpdate(userCart === null || userCart === void 0 ? void 0 : userCart._id, {
        $inc: { totalCartPrice: -no_free_perncentage },
        $set: { isPointsUsed: true },
    }, { new: true })
        .then((res) => {
        console.log(`the Cart Should Be Updated: why is not updated: `.bgCyan);
        user_model_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, { $set: { points: tempTotalDeductionInPoints } }, { new: true }).then((data) => {
            isDone = true;
        });
    })
        .catch((e) => {
        isDone = false;
        console.log(`What is the CArt PRobolem: `.bgRed, e.message);
    });
    return isDone;
};
const staticallyApplyPointsForSpecificUser = async (user, pointsManagement) => {
    // this will make call the other Route that we have
    const userCart = await cart_model_1.Cart.findOne({ user: user === null || user === void 0 ? void 0 : user._id }).sort("-createdAt");
    const { totalPointConversionForOneUnit, max } = pointsManagement;
    const totalAllowed = (0, exports.processUserPointAndTurnintoCurrency)(max, totalPointConversionForOneUnit);
    console.log("what is the total Allowed : ", totalAllowed);
    if (totalAllowed >= (userCart === null || userCart === void 0 ? void 0 : userCart.totalCartPrice)) {
        throw new Error(JSON.stringify({
            error_en: "This Order is To Low to Request Points For",
            error_ar: "bteeeekh5a",
        }));
    }
    else {
        const isExist = await staticPointRequest_model_1.StaticPoints.findOne({ name: user === null || user === void 0 ? void 0 : user.name });
        if (isExist) {
            // return res.status(400).send({error_en:'You Have Already Sent Request That is not Been Processed'})
            throw new Error(JSON.stringify({
                error_en: "You Already have sent Request that is been processed Before",
                error_ar: "لقد أرسلت بالفعل طلبًا تم معالجته من قبل",
            }));
        }
        const { data } = await axios_1.default.post(`${process.env.APP_URL}/api/v1/static-point-request`, {
            user,
            pointsManagement,
        });
        return data;
    }
};
const grantUserPointsBasedOnByAdminPermissionOrDynamic = async (req, res) => {
    let user = req === null || req === void 0 ? void 0 : req.user;
    const pointsMangement = await (0, exports.getPoinst)();
    if ((user === null || user === void 0 ? void 0 : user.points) < (pointsMangement === null || pointsMangement === void 0 ? void 0 : pointsMangement.min))
        return res
            .status(400)
            .send({
            error_en: "Dont Have Enough Points",
            error_ar: "لا تملك نقاط كافية لاسترداد هذه القسيمة",
        });
    console.log("What is the type of the point Request: ", pointsMangement === null || pointsMangement === void 0 ? void 0 : pointsMangement.status);
    if ((pointsMangement === null || pointsMangement === void 0 ? void 0 : pointsMangement.status) == "dynamic") {
        if ((user === null || user === void 0 ? void 0 : user.points) >= pointsMangement.min) {
            dynamicallyApplyPointsForSpecificUser(user, pointsMangement)
                .then((data) => {
                res
                    .status(200)
                    .send({
                    message_en: "Your Request is been Granted",
                    message_ar: "تم قبول طلبك لاستخدام نقاطك",
                    data,
                });
            })
                .catch((e) => {
                return res
                    .status(400)
                    .send(JSON.parse(e.message ||
                    `{error_en:"Some Thing Went Wrong",error_ar:"حدث خطأ ما"}`));
            });
        }
    }
    else {
        staticallyApplyPointsForSpecificUser(user, pointsMangement)
            .then((data) => {
            return res.status(200).send(JSON.stringify(data));
        })
            .catch((e) => {
            return res.status(400).send(JSON.parse(e.message));
        });
    }
};
exports.grantUserPointsBasedOnByAdminPermissionOrDynamic = grantUserPointsBasedOnByAdminPermissionOrDynamic;
// calculate user point from the order i will get the order then i will extract the total price of each product (product_price*quantity) accumulation
const calculateUserPoints = async (order) => {
    // get the points first to calculate how many point the user should have on that order
    const points = await (0, exports.getPoinst)();
    console.log(`'What the Order Contains: ',${order}`);
    console.log("What is the point have: ", points);
    console.log("What is the total point on that order: ", (points === null || points === void 0 ? void 0 : points.noOfPointsInOneUnit) * (order === null || order === void 0 ? void 0 : order.totalPrice));
    return Math.floor((points === null || points === void 0 ? void 0 : points.noOfPointsInOneUnit) * (order === null || order === void 0 ? void 0 : order.totalPrice));
};
exports.calculateUserPoints = calculateUserPoints;
