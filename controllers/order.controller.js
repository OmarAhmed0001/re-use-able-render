"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOrder = exports.createShippingOrder = exports.createItemRepository = exports.deleteOrder = exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getMyOrders = exports.createOnlineOrderInvoice = exports.createOnlineOrder = exports.verifyOrder = exports.createOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cart_model_1 = require("../models/cart.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const order_model_1 = require("../models/order.model");
const status_enum_1 = require("../interfaces/status/status.enum");
const product_model_1 = require("../models/product.model");
const moyasar_1 = __importDefault(require("../utils/moyasar"));
const ApiFeatures_1 = require("../utils/ApiFeatures");
const logex_1 = __importDefault(require("../utils/logex"));
const user_model_1 = require("../models/user.model");
const category_model_1 = require("../models/category.model");
const pointsManagement_controller_1 = require("./pointsManagement.controller");
const repository_model_1 = require("../models/repository.model");
const getProductPrice = ({ priceBeforeDiscount, priceAfterDiscount, }) => {
    if (priceAfterDiscount && priceAfterDiscount > 0) {
        return priceAfterDiscount;
    }
    return priceBeforeDiscount;
};
const generateItemsData = (items) => {
    const itemsData = items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        totalPrice: item.total,
        properties: item.properties,
    }));
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
    return { items: itemsData, quantity, totalPrice };
};
const updateOrdersStatus = async () => {
    const logex = new logex_1.default();
    const storeOrders = await logex.getOrders();
    if (!storeOrders.status) {
        return;
    }
    const bulkOption = storeOrders.data.map((item) => ({
        updateOne: {
            filter: { _id: item.order_id },
            update: { status: item.status },
        },
    }));
    await order_model_1.Order.bulkWrite(bulkOption, {});
};
// @desc    Create Order
// @route   POST /api/v1/orders
// @access  Private (User)
exports.createOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get user
    const { _id } = req.user;
    const { city, orderNotes, phone, email, name, area, address, postalCode } = req.body;
    // 2- add address in database for user
    const newAddress = { city, area, address, postalCode };
    const addresses = await user_model_1.User.findById(req.user.id).select("addressesList");
    let resultAddresses = [{}];
    if (addresses) {
        resultAddresses = addresses.addressesList.filter((item) => {
            if (item.city === city &&
                item.area === area &&
                item.address === address &&
                item.postalCode === postalCode) {
                return true;
            }
            return false;
        });
    }
    if (resultAddresses.length === 0) {
        if (newAddress) {
            const userLogged = await user_model_1.User.findByIdAndUpdate(req.user._id, {
                $addToSet: { addressesList: newAddress },
            }, {
                new: true,
            });
            if (userLogged) {
                // if length equal 5 delete oldest address in arry
                if (userLogged.addressesList.length > 5) {
                    const res = await user_model_1.User.findByIdAndUpdate(req.user._id, {
                        $pull: {
                            addressesList: { _id: userLogged.addressesList[0]._id },
                        },
                    }, {
                        new: true,
                    });
                }
            }
        }
    }
    // 3- check if user has cart
    const cart = await cart_model_1.Cart.findOne({ user: _id }).populate([
        { path: "user", model: "User", select: "name email phone image" },
        {
            path: "cartItems.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType sendToDelivery",
        },
    ]);
    if (!cart) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (cart.cartItems.length < 1) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- check if user have order with same cart id
    const hasOrder = await order_model_1.Order.findOne({
        cartId: cart._id,
        $or: [
            { isVerified: false },
            {
                isVerified: true,
                status: "initiated",
                $or: [{ paymentType: "online" }, { paymentType: "both" }],
            },
        ],
    });
    if (hasOrder) {
        // delete order
        await order_model_1.Order.findByIdAndDelete(hasOrder._id);
    }
    // 5- get user info and send a verification code to the user phone number
    // const verificationCode = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    const verificationCode = "123456";
    const verificationCodeExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const hashVerificationCode = crypto_1.default
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");
    // 3) send the reset code via email
    // try {
    //   await sendSMSTaqnyat({
    //     recipient: parseInt(req.body.phone),
    //     code: verificationCode,
    //   });
    // } catch (err) {
    //   return next(
    //     new ApiError(
    //       {
    //         en: "There Is An Error In Sending SMS",
    //         ar: "هناك خطأ في إرسال الرسالة القصيرة",
    //       },
    //       StatusCodes.INTERNAL_SERVER_ERROR
    //     )
    //   );
    // }
    // 6- calculate total price and quantity
    const totalPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalQuantity = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isOnline = cart.cartItems.some((item) => item.product.paymentType === "online");
    const isCash = cart.cartItems.some((item) => item.product.paymentType === "cash");
    const isBoth = cart.cartItems.some((item) => item.product.paymentType === "both");
    const paymentType = isCash && (isOnline || isBoth)
        ? "both"
        : isOnline || isBoth
            ? "online"
            : "cash";
    const cashData = cart.cartItems.filter((item) => item.product.paymentType === "cash");
    const onlineData = cart.cartItems.filter((item) => item.product.paymentType === "online" ||
        item.product.paymentType === "both");
    const onlineItems = generateItemsData(onlineData);
    const cashItems = generateItemsData(cashData);
    // 7- check quantity
    cart.cartItems.map(async (cart) => {
        const id = cart.product;
        const product = await product_model_1.Product.findById(id);
        if (product) {
            if (cart.product.quantity > product.quantity) {
                return next(new ApiError_1.default({
                    en: `Product Quantity is not enough ${product.title_en}`,
                    ar: `كمية المنتج غير كافية ${product.title_ar}`,
                }, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
        }
    });
    // 8- create order
    const order = await order_model_1.Order.create({
        user: _id,
        cartId: cart._id,
        totalPrice,
        totalQuantity,
        city,
        phone,
        email,
        name,
        area,
        address,
        postalCode,
        orderNotes,
        verificationCode: hashVerificationCode,
        verificationCodeExpiresAt,
        paymentType,
        payWith: {
            source: {},
        },
        onlineItems: onlineItems,
        cashItems: cashItems,
    });
    let _a = order.toObject(), { verificationCode: _, verificationCodeExpiresAt: __, payWith } = _a, orderResponse = __rest(_a, ["verificationCode", "verificationCodeExpiresAt", "payWith"]);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: orderResponse,
        success_en: "Order Initiated Successfully",
        success_ar: "تم إنشاء الطلب بنجاح",
    });
});
// @desc    Verify Order
// @route   POST /api/v1/orders/verifyOrder
// @access  Private (User)
exports.verifyOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f;
    const { _id } = req.user;
    const { code, phone } = req.body;
    const hashVerificationCode = crypto_1.default
        .createHash("sha256")
        .update(code)
        .digest("hex");
    const order = await order_model_1.Order.findOne({
        user: _id,
        verificationCode: hashVerificationCode,
        verificationCodeExpiresAt: { $gt: Date.now() },
        phone: phone,
    });
    if (!order) {
        return next(new ApiError_1.default({
            en: "Invalid Code",
            ar: "كود غير صحيح",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // verify order
    order.isVerified = true;
    order.verificationCodeExpiresAt = 0;
    //  online , cash , both
    switch (order.paymentType) {
        case "cash":
            // create cash payment
            // update products sales
            const bulkOption = order.cashItems.items.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: {
                        $inc: { sales: +item.quantity, quantity: -item.quantity },
                    },
                },
            }));
            await product_model_1.Product.bulkWrite(bulkOption, {});
            // delete cart
            const userPoints = await (0, pointsManagement_controller_1.calculateUserPoints)(order);
            // STEPS FOR DELETING THE CART
            const cart = await cart_model_1.Cart.findByIdAndDelete(order.cartId);
            if (!cart) {
                return next(new ApiError_1.default({
                    en: "Cart Not Found",
                    ar: "عربة التسوق غير موجودة",
                }, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
            // find marketer and update points
            if (((_a = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _a === void 0 ? void 0 : _a.couponReference) &&
                ((_b = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _b === void 0 ? void 0 : _b.used) &&
                ((_c = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _c === void 0 ? void 0 : _c.commissionMarketer)) {
                await user_model_1.User.findOneAndUpdate({ couponMarketer: (_d = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _d === void 0 ? void 0 : _d.couponReference.toString() }, {
                    $inc: {
                        totalCommission: Math.floor((_e = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _e === void 0 ? void 0 : _e.commissionMarketer),
                    },
                    $push: {
                        pointsMarketer: {
                            order: order._id,
                            commission: Math.floor((_f = cart === null || cart === void 0 ? void 0 : cart.coupon) === null || _f === void 0 ? void 0 : _f.commissionMarketer),
                        },
                    },
                }, { new: true });
            }
            await user_model_1.User.updateOne({ _id: _id }, { $inc: { revinue: order.cashItems.totalPrice, points: userPoints } });
            await Promise.all(order.cashItems.items.map(async (item) => {
                const product = await product_model_1.Product.findOne({ _id: item.product });
                await category_model_1.Category.updateOne({ _id: product === null || product === void 0 ? void 0 : product.category }, { $inc: { revinue: item.totalPrice } });
            }));
            // change status to created and payWith to none
            order.status = "created";
            order.payWith.type = "none";
            await order.save();
            res.status(http_status_codes_1.StatusCodes.OK).json({
                status: status_enum_1.Status.SUCCESS,
                data: order,
                paymentType: order.paymentType,
                success_en: "Order Created Successfully",
                success_ar: "تم إنشاء الطلب بنجاح",
            });
            break;
        default:
            const { city, orderNotes, phone, email } = order;
            await order.save();
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                status: status_enum_1.Status.SUCCESS,
                data: order,
                metadata: {
                    cart_id: order.cartId,
                    user_id: _id,
                    order_id: order._id,
                    total_quantity: order.totalQuantity,
                    total_price: order.onlineItems.totalPrice,
                    city,
                    orderNotes,
                    description: `Payment for order: ${phone}, ${email}, ${city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
                    phone,
                    email,
                    paymentType: "online",
                },
                paymentType: order.paymentType,
                success_en: "Order Verified Successfully",
                success_ar: "تم التحقق من الطلب بنجاح",
            });
            break;
    }
});
// @desc    Create Online Order
// @route   POST /api/v1/orders/online
// @access  Private (User)
exports.createOnlineOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    // create online payment
    const { _id } = req.user;
    const cart = await cart_model_1.Cart.findOne({ user: _id });
    if (!cart) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const order = await order_model_1.Order.findOne({ user: _id, cartId: cart._id });
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const { city, orderNotes, phone, email } = order;
    const { type, cvc, month, year, number, name } = req.body;
    const moyasar = new moyasar_1.default();
    const callback_url = `https://saritestsecond.online:3000/thanksOrder`;
    let paymentOptions;
    switch (type) {
        case "creditcard":
            paymentOptions = {
                amount: order.onlineItems.totalPrice * 100,
                currency: "SAR",
                description: `Payment for order: ${phone}, ${email}, ${city}`,
                callback_url,
                metadata: {
                    cart_id: order.cartId,
                    user_id: _id,
                    order_id: order._id,
                    total_quantity: order.totalQuantity,
                    total_price: order.onlineItems.totalPrice,
                    city,
                    orderNotes,
                    description: `Payment for order: ${phone}, ${email}, ${city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
                    phone,
                    email,
                    paymentType: "online",
                },
                source: {
                    type,
                    cvc,
                    month,
                    year,
                    number,
                    first_name: name,
                    name: name,
                },
            };
            break;
        case "applepay":
            paymentOptions = {};
            break;
        case "stcpay":
            paymentOptions = {};
            break;
        default:
            return next(new ApiError_1.default({
                en: "Invalid Payment Type",
                ar: "نوع الدفع غير صحيح",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    const paymentResult = await moyasar.createPayment(paymentOptions);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: {
            currency: paymentResult.currency,
            amount_format: paymentResult.amount_format,
            description: paymentResult.description,
            transaction_url: paymentResult.source.transaction_url,
        },
        paymentType: order.paymentType,
        success_en: "Order Created Successfully",
        success_ar: "تم إنشاء الطلب بنجاح",
    });
});
// @desc    Create Online Order (Invoice)
// @route   POST /api/v1/orders/online
// @access  Private (User)
exports.createOnlineOrderInvoice = (0, express_async_handler_1.default)(async (req, res, next) => {
    // create online payment
    const { _id } = req.user;
    const cart = await cart_model_1.Cart.findOne({ user: _id });
    if (!cart) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const order = await order_model_1.Order.findOne({ user: _id, cartId: cart._id });
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const { city, orderNotes, phone, email } = order;
    // const { type, cvc, month, year, number, name } = req.body;
    const moyasar = new moyasar_1.default();
    const success_url = `https://saritestsecond.online:3000/thanksOrder`;
    const back_url = `https://saritestsecond.online:3000/cart`;
    let invoiceOptions = {
        amount: order.onlineItems.totalPrice * 100,
        currency: "SAR",
        description: `Pay ${order.onlineItems.totalPrice} SAR`,
        // description: `Payment for order: ${phone}, ${email}, ${city}`,
        success_url,
        back_url,
        metadata: {
            cart_id: order.cartId,
            user_id: _id,
            order_id: order._id,
            total_quantity: order.totalQuantity,
            total_price: order.onlineItems.totalPrice,
            city,
            orderNotes,
            description: `Payment for order: ${phone}, ${email}, ${city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
            phone,
            email,
            paymentType: "online",
        },
    };
    const paymentResult = await moyasar.createInvoice(invoiceOptions);
    order.invoiceId = paymentResult.id;
    await order.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: {
            transaction_url: paymentResult.url,
        },
        paymentType: order.paymentType,
        success_en: "Order Created Successfully",
        success_ar: "تم إنشاء الطلب بنجاح",
    });
});
// @desc    Get My Orders
// @route   GET /api/v1/orders/myOrders
// @access  Private (User)
exports.getMyOrders = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { _id } = req.user;
    const orders = await order_model_1.Order.find({
        user: _id,
        active: true,
        status: "created",
    }).populate([
        { path: "user", model: "User", select: "name email phone image" },
        {
            path: "onlineItems.items.product",
            model: "Product",
            select: "directDownloadLink title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
        },
        {
            path: "cashItems.items.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
        },
    ]);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: orders,
        success_en: "Orders Fetched Successfully",
        success_ar: "تم جلب الطلبات بنجاح",
    });
});
// @desc    Get Order By Id
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const order = await order_model_1.Order.findById({ _id: id, active: true }).populate([
        { path: "user", model: "User", select: "name email phone image" },
        {
            path: "onlineItems.items.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
        },
        {
            path: "cashItems.items.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
        },
    ]);
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: order,
        success_en: "Order Fetched Successfully",
        success_ar: "تم جلب الطلب بنجاح",
    });
});
// @desc    Get All Orders
// @route   GET /api/v1/orders
// @access  Private (Admin)
exports.getAllOrders = (0, express_async_handler_1.default)(async (req, res, next) => {
    // add pagination
    // await updateOrdersStatus();
    const ordersCount = await order_model_1.Order.countDocuments({});
    const query = req.query;
    const mongoQuery = order_model_1.Order.find({ active: true });
    const orders = await order_model_1.Order.find({ active: true }).populate([
        {
            path: "onlineItems.items.product",
            model: "Product",
            select: "title_en title_ar images quantity",
        },
        {
            path: "cashItems.items.product",
            model: "Product",
            select: "title_en title_ar images quantity ",
        },
    ]);
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    if (data.length === 0) {
        return next(new ApiError_1.default({ en: "not found", ar: "غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // const orders = await mongooseQuery.populate([
    //   { path: "user", model: "User", select: "name email phone image" },
    //   {
    //     path: "onlineItems.items.product",
    //     model: "Product",
    //     select:
    //       "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
    //   },
    //   {
    //     path: "cashItems.items.product",
    //     model: "Product",
    //     select:
    //       "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery",
    //   },
    // ]);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: data.length,
        paginationResult,
        data: data,
        success_en: "Orders Fetched Successfully",
        success_ar: "تم جلب الطلبات بنجاح",
    });
});
// @desc    update order status
// @route   PUT /api/v1/orders/:id
// @access  Private (Admin)
exports.updateOrderStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await order_model_1.Order.findByIdAndUpdate(id, {
        status,
    }, {
        new: true,
    });
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: order,
        success_en: "Order Status Updated Successfully",
        success_ar: "تم تحديث حالة الطلب بنجاح",
    });
});
// @desc    delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private (Admin)
// export const deleteOrder = deleteOneItemById(Order);
exports.deleteOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get id for item from params
    const { id } = req.params;
    const order = await order_model_1.Order.findById({ _id: id });
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const updatedActiveItem = await order_model_1.Order.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
    if (!updatedActiveItem) {
        return next(new ApiError_1.default({
            en: "An error occurred while updating",
            ar: "حدث خطأ أثناء التحديث",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 4- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "deleted successfully",
        success_ar: "تم الحذف بنجاح",
    });
});
// @desc    create item from order to specific repository
// @route   POST /api/v1/orders/createItemRepository
// @access  Private (Admin)
exports.createItemRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    const id = req.body.id;
    const itemId = req.body.itemId;
    const typeOfItem = req.body.typeOfItem;
    const repos = req.body.repos;
    const order = await order_model_1.Order.findById(id);
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (typeOfItem === "online") {
        const item = order.onlineItems.items.find((item) => item.product.toString() === itemId);
        if (!item) {
            return next(new ApiError_1.default({
                en: "Product Not Found",
                ar: "المنتج غير موجود",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        item.repositories = repos;
    }
    else {
        const item = order.cashItems.items.find((item) => item.product.toString() === itemId);
        if (!item) {
            return next(new ApiError_1.default({
                en: "Product Not Found",
                ar: "المنتج غير موجود",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        item.repositories = repos;
    }
    await order.save();
    // update quantity of product from array in repository
    await Promise.all(repos.map(async (repo) => {
        const Repos = await repository_model_1.Repository.findOne({ _id: repo.repository });
        if (Repos) {
            const product = Repos.products.find((item) => item.productId.toString() === itemId);
            if (product) {
                if (product.quantity >= repo.quantity) {
                    product.quantity -= repo.quantity;
                    Repos.quantity -= repo.quantity;
                }
                else {
                    return next(new ApiError_1.default({
                        en: "Insufficient Quantity in Repository",
                        ar: "الكمية غير كافية في المستودع",
                    }, http_status_codes_1.StatusCodes.BAD_REQUEST));
                }
            }
            await Repos.save();
        }
        if (!Repos) {
            return next(new ApiError_1.default({
                en: "Repository Not Found",
                ar: "المستودع غير موجود",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
    }));
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Item Created Successfully",
        success_ar: "تم إنشاء العنصر بنجاح",
    });
});
// @desc    create shipping order
// @route   POST /api/v1/orders/shipping/:id
// @access  Private (Admin)
exports.createShippingOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { weight } = req.body;
    let order = await order_model_1.Order.findById(id).populate([
        { path: "user", model: "User", select: "name email phone image" },
        {
            path: "onlineItems.items.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery weight deliveryType",
        },
        {
            path: "cashItems.items.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery weight deliveryType",
        },
    ]);
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if order is already sent to delivery
    if (order.sendToDelivery) {
        return next(new ApiError_1.default({
            en: "Order Already Sent To Delivery",
            ar: "تم إرسال الطلب بالفعل للتوصيل",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (!order.isVerified) {
        return next(new ApiError_1.default({
            en: "Order Not Verified",
            ar: "الطلب غير موثق",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    order = order.toObject();
    const logex = new logex_1.default();
    const response = await logex.createOrder(order);
    if (!(response === null || response === void 0 ? void 0 : response.status)) {
        return next(new ApiError_1.default({
            en: response.message_en,
            ar: response.message_ar,
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // update order sendToDelivery to true
    await order_model_1.Order.findByIdAndUpdate(id, { sendToDelivery: true });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: response === null || response === void 0 ? void 0 : response.data,
        success_en: "Order Created Successfully",
        success_ar: "تم إنشاء الطلب بنجاح",
    });
});
// @desc    track Order
// @route   GET /api/v1/orders/trackOrder/:id
// @access  Private (Admin)
exports.trackOrder = (0, express_async_handler_1.default)(async (req, res, next) => {
    const order_id = req.params.id;
    const order = await order_model_1.Order.findById(order_id);
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order Not Found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const logex = new logex_1.default();
    const response = await logex.trackOrderStatus(order_id);
    if (!response.status) {
        return next(new ApiError_1.default({
            en: response.message_en,
            ar: response.message_ar,
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    order.status = response.data.status;
    order.tracking = response.data.tracking;
    await order.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: response.data,
        success_en: "Order Tracked Successfully",
        success_ar: "تم تتبع الطلب بنجاح",
    });
});
