"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCoupon = exports.deleteCart = exports.deleteCartItem = exports.getAllCarts = exports.getCart = exports.addToCart = exports.cartResponse = void 0;
//@ts-nocheck
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const cart_model_1 = require("../models/cart.model");
const coupon_model_1 = require("../models/coupon.model");
const product_model_1 = require("../models/product.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiFeatures_1 = require("../utils/ApiFeatures");
const factory_controller_1 = require("./factory.controller");
const cartResponse = ({ cart, totalPrice, totalQuantity, }) => {
    var _a;
    const onlineItems = {
        items: cart.cartItems.filter((item) => item.product.paymentType === "online" ||
            item.product.paymentType === "both"),
        quantity: cart.cartItems
            .filter((item) => item.product.paymentType === "online" ||
            item.product.paymentType === "both")
            .reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cart.cartItems
            .filter((item) => item.product.paymentType === "online" ||
            item.product.paymentType === "both")
            .reduce((sum, item) => sum + item.total, 0),
    };
    const cashItems = {
        items: cart.cartItems.filter((item) => item.product.paymentType === "cash"),
        quantity: cart.cartItems
            .filter((item) => item.product.paymentType === "cash")
            .reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cart.cartItems
            .filter((item) => item.product.paymentType === "cash")
            .reduce((sum, item) => sum + item.total, 0),
    };
    const isCash = cashItems.items.length > 0;
    const isOnline = onlineItems.items.length > 0;
    // cash online both
    const transactionType = isCash && isOnline ? "both" : isCash ? "cash" : "online";
    return {
        user: cart.user,
        couponUsed: (_a = cart.coupon) === null || _a === void 0 ? void 0 : _a.used,
        transactionType,
        totalQuantity,
        totalPrice,
        onlineItems,
        cashItems,
        isPointUsed: cart === null || cart === void 0 ? void 0 : cart.isPointsUsed,
    };
};
exports.cartResponse = cartResponse;
const calculateCartItemPrice = ({ product, quantity, properties, }) => {
    let totalPrice = (product.priceAfterDiscount || product.priceBeforeDiscount) * quantity;
    if (properties && properties.length > 0 && product.qualities) {
        const selectedProperties = product.qualities.filter((quality) => properties.findIndex((prop) => prop.key_en === quality.key_en && prop.key_ar === quality.key_ar) > -1);
        const prices = selectedProperties.map((quality) => {
            const values = quality.values.find((value) => properties.find((prop) => prop.value_en === value.value_en && prop.value_ar === value.value_ar));
            return values || { price: 0 };
        });
        const extraPrice = prices.reduce((sum, price) => sum + price.price, 0);
        totalPrice =
            ((product.priceAfterDiscount || product.priceBeforeDiscount) +
                extraPrice) *
                quantity;
    }
    return totalPrice;
};
// @desc    Add Product To Cart
// @route   POST /api/v1/cart/:productId
// @body    { quantity }
// @access  Private (user)
exports.addToCart = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { _id } = req.user;
    const { quantity, properties } = req.body;
    const { productId } = req.params;
    // check if the product exists
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product Not Found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if the quantity is more than the available quantity
    if (quantity > product.quantity || product.quantity === 0) {
        return next(new ApiError_1.default({
            en: "Quantity Not Available",
            ar: "الكمية غير متوفرة",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // get the cart of the user
    const cart = await cart_model_1.Cart.findOne({ user: _id });
    // if no cart, create a new one
    if (!cart) {
        let totalPrice = calculateCartItemPrice({
            product,
            quantity,
            properties,
        });
        // create a new cart
        const cart = await cart_model_1.Cart.create({
            user: _id,
            cartItems: [
                {
                    properties,
                    product: product._id,
                    quantity,
                    total: totalPrice,
                },
            ],
            totalCartPrice: totalPrice,
        });
        const totalCartPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
        const populatedCart = await cart.populate([
            { path: "user", model: "User", select: "name email image" },
            {
                path: "cartItems.product",
                model: "Product",
                select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType",
            },
        ]);
        // await Cart.findOneAndUpdate(
        //   { user: _id },
        //   { totalCartPrice: cart.totalCartPrice + totalPrice },
        //   { new: true }
        // );
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            status: status_enum_1.Status.SUCCESS,
            data: (0, exports.cartResponse)({
                cart: populatedCart.toJSON(),
                totalPrice: totalCartPrice,
                totalQuantity: quantity,
            }),
            totalCartPrice: cart === null || cart === void 0 ? void 0 : cart.totalCartPrice,
            success_en: "Product Saved To Cart Successfully",
            success_ar: "تم حفظ المنتج في عربة التسوق بنجاح",
        });
        return;
    }
    // if there is a cart, check if the product is already in the cart
    const itemIndex = cart.cartItems.findIndex((item) => item.product == productId);
    if (itemIndex > -1) {
        // if the product is already in the cart, update the quantity
        cart.cartItems[itemIndex].quantity = quantity;
        cart.cartItems[itemIndex].total = calculateCartItemPrice({
            product,
            quantity,
            properties: properties || cart.cartItems[itemIndex].properties,
        });
        const totalQuantity = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (properties && properties.length > 0) {
            cart.cartItems[itemIndex].properties = properties;
        }
        const totalCartPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
        cart['totalCartPrice'] = totalCartPrice;
        await cart.save();
        const populatedCart = await cart.populate([
            { path: "user", model: "User", select: "name email image" },
            {
                path: "cartItems.product",
                model: "Product",
                select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType",
            },
        ]);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            status: status_enum_1.Status.SUCCESS,
            data: (0, exports.cartResponse)({
                cart: populatedCart.toJSON(),
                totalPrice: totalCartPrice,
                totalQuantity,
            }),
            totalCartPrice: cart === null || cart === void 0 ? void 0 : cart.totalCartPrice,
            success_en: "Product Saved To Cart Successfully",
            success_ar: "تم حفظ المنتج في عربة التسوق بنجاح",
        });
        return;
    }
    // if the product is not in the cart, add it
    const total = calculateCartItemPrice({ product, quantity, properties });
    cart.cartItems.push({ product: product._id, quantity, total, properties });
    const cartUPdated = await cart_model_1.Cart.findOneAndUpdate({ user: _id }, { totalCartPrice: cart.totalCartPrice + total }, { new: true });
    const totalQuantity = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    await cart.save();
    const totalCartPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
    const populatedCart = await cart.populate([
        { path: "user", model: "User", select: "name email image" },
        {
            path: "cartItems.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType",
        },
    ]);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: (0, exports.cartResponse)({
            cart: populatedCart.toJSON(),
            totalPrice: totalCartPrice,
            totalQuantity,
        }),
        totalCartPrice: cart === null || cart === void 0 ? void 0 : cart.totalCartPrice,
        success_en: "Product Saved To Cart Successfully",
        success_ar: "تم حفظ المنتج في عربة التسوق بنجاح",
    });
});
// @desc    Get Cart
// @route   GET /api/v1/cart
// @body    {}
// @access  Private (user)
exports.getCart = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { _id } = req.user;
    const cart = await cart_model_1.Cart.findOne({ user: _id }).populate([
        { path: "user", model: "User", select: "name email image" },
        {
            path: "cartItems.product",
            model: "Product",
            select: "title_en title_ar description_en description_ar  rating priceBeforeDiscount priceAfterDiscount images quantity paymentType",
        },
    ]);
    if (!cart) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const totalCartPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalQuantity = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: (0, exports.cartResponse)({
            cart: cart,
            totalPrice: totalCartPrice,
            totalQuantity,
        }),
        totalCartPrice: cart === null || cart === void 0 ? void 0 : cart.totalCartPrice,
        _id: cart._id,
        success_en: "Cart Fetched Successfully",
        success_ar: "تم جلب عربة التسوق بنجاح",
    });
});
// @desc    Get Cart
// @route   GET /api/v1/cart
// @body    {}
// @access  Private (admin)
exports.getAllCarts = (0, express_async_handler_1.default)(async (req, res, next) => {
    const query = req.query;
    const mongoQuery = cart_model_1.Cart.find({ user: { $ne: null } }).populate([
        { path: "user", model: "User", select: "name email" },
    ]).select("-coupon  -isFreezed -isPointsUsed -updatedAt -__v");
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(mongoQuery, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    if (data.length === 0) {
        return next(new ApiError_1.default({
            en: "No Carts Found",
            ar: "لا يوجد عربات تسوق",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        result: data.length,
        paginationResult,
        data: data,
        success_en: "Carts Fetched Successfully",
        success_ar: "تم جلب عربات التسوق بنجاح",
    });
});
// @desc    Delete Cart
// @route   DELETE /api/v1/cart/:productId
// @body    {}
// @access  Private (user)
exports.deleteCartItem = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { _id } = req.user;
    const { productId } = req.params;
    // check if the product exists
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product Not Found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // get the cart of the user and delete the product from it
    const cart = await cart_model_1.Cart.findOneAndUpdate({ user: _id }, { $pull: { cartItems: { product: productId } } }, { new: true }).populate([
        { path: "user", model: "User", select: "name email image" },
        {
            path: "cartItems.product",
            model: "Product",
            select: "title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType",
        },
    ]);
    if (!cart) {
        return next(new ApiError_1.default({
            en: "Cart is Empty",
            ar: "عربة التسوق فارغة",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // check if cart cartItems is empty
    if (cart.cartItems.length < 1) {
        await cart_model_1.Cart.findOneAndDelete({ user: _id });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: null,
            success_en: "Product Deleted From Cart Successfully",
            success_ar: "تم حذف المنتج من عربة التسوق بنجاح",
        });
        return;
    }
    const totalCartPrice = cart.cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalQuantity = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    await cart_model_1.Cart.findByIdAndUpdate({ _id: cart._id }, { totalCartPrice }, { new: true });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: (0, exports.cartResponse)({
            cart: cart.toJSON(),
            totalPrice: totalCartPrice,
            totalQuantity,
        }),
        success_en: "Product Deleted From Cart Successfully",
        success_ar: "تم حذف المنتج من عربة التسوق بنجاح",
    });
});
// @desc    Delete Cart
// @route   Delete /api/v1/cart/:id
// @body    {}
// @access  Private (admin)
exports.deleteCart = (0, factory_controller_1.deleteOneItemById)(cart_model_1.Cart);
// @desc    Verify Coupon
// @route   POST /api/v1/cart/coupon
// @body    { coupon }
// @access  Private (user)
exports.verifyCoupon = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get the data
    const { code, productsIds } = req.body;
    const { _id } = req.user;
    // 2- check if the coupon is valid
    const CouponExist = await coupon_model_1.Coupon.findOne({ code });
    if (!CouponExist) {
        return next(new ApiError_1.default({
            en: "Coupon Not Found",
            ar: "الكوبون غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- check if the cart used coupon before
    const cart = await cart_model_1.Cart.findOne({
        user: req.user._id,
        "coupon.used": false,
    });
    if (!cart) {
        return next(new ApiError_1.default({
            en: "That Cart Used Coupon Before",
            ar: "عربة التسوق تم استخدام الكوبون بها من قبل",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    console.log('CouponExist : ', CouponExist);
    // 4- check if the coupon is normal increase the used number
    if (CouponExist.type === "normal") {
        const checkUsedCoupon = await coupon_model_1.Coupon.findOne({
            _id: CouponExist._id,
            "users.user": req.user._id,
        });
        if (!checkUsedCoupon) {
            await coupon_model_1.Coupon.findOneAndUpdate({ _id: CouponExist._id }, {
                $push: {
                    users: {
                        user: req.user._id,
                        usedNumber: 1,
                    },
                },
            }, { new: true });
        }
        else {
            const result = await coupon_model_1.Coupon.findOneAndUpdate({
                _id: CouponExist._id,
                "users.user": req.user._id,
                "users.usedNumber": { $lt: CouponExist.limit },
            }, {
                $inc: {
                    "users.$.usedNumber": 1,
                },
            }, { new: true });
            if (!result) {
                return next(new ApiError_1.default({
                    en: "Coupon Limit Exceeded",
                    ar: "تجاوز الحد الأقصى للكوبون",
                }, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
        }
        let minusFromTotal = 0;
        const result = cart.cartItems.map((item) => {
            const product = productsIds.find((productId) => productId === item.product.toString());
            if (product) {
                const miuns = Math.floor((item.total * CouponExist.discount) / 100);
                item.total = (item.total - miuns);
                minusFromTotal = minusFromTotal + miuns;
            }
            return item;
        });
        console.log("minusFromTotal : ", minusFromTotal);
        // 8- update the cart
        const output = await cart_model_1.Cart.findByIdAndUpdate(cart._id, { cartItems: result, coupon: { couponReference: CouponExist._id, used: true }, totalCartPrice: cart.totalCartPrice - minusFromTotal }, { new: true });
        if (!output) {
            return next(new ApiError_1.default({
                en: "Cart Not Found",
                ar: "عربة التسوق غير موجودة",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // 5- response with the updated cart
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: output,
            success_en: "Coupon Verified Successfully",
            success_ar: "تم التحقق من الكوبون بنجاح",
        });
    }
    else if (CouponExist.type === "marketing") {
        // 3- apply the coupon on the products
        let totalForMarketer = 0;
        let minusFromTotal = 0;
        const result = cart.cartItems.map((item) => {
            const product = productsIds.find((productId) => productId === item.product.toString());
            if (product) {
                const miuns = Math.floor((item.total * CouponExist.discount) / 100);
                totalForMarketer = totalForMarketer + (item.total * CouponExist.commissionMarketer / 100);
                item.total = item.total - miuns;
                minusFromTotal = minusFromTotal + miuns;
            }
            return item;
        });
        // 4- update the cart
        const output = await cart_model_1.Cart.findByIdAndUpdate(cart._id, { cartItems: result, coupon: { couponReference: CouponExist._id, commissionMarketer: totalForMarketer, used: true }, totalCartPrice: cart.totalCartPrice - minusFromTotal }, { new: true });
        if (!output) {
            return next(new ApiError_1.default({
                en: "Cart Not Found",
                ar: "عربة التسوق غير موجودة",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        // 5- response with the updated cart
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: status_enum_1.Status.SUCCESS,
            data: output,
            success_en: "Coupon Verified Successfully",
            success_ar: "تم التحقق من الكوبون بنجاح",
        });
    }
});
//   const CouponExist = await Coupon.findOne({ code: req.body.coupon });
//   if (!CouponExist) {
//     return next(
//       new ApiError(
//         {
//           en: "Coupon Not Found",
//           ar: "الكوبون غير موجود",
//         },
//         StatusCodes.NOT_FOUND
//       )
//     );
//   }
//   if (CouponExist.type === "marketing") {
//     // 1- check if the coupon is valid
//     const cart = await Cart.findOne({
//       user: (req.user! as IUser)._id,
//       "coupon.used": false,
//     });
//     if (!cart) {
//       return next(
//         new ApiError(
//           {
//             en: "That Cart Used Coupon Before",
//             ar: "عربة التسوق تم استخدام الكوبون بها من قبل",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }
//     // 2- collect all products that the coupon can be applied on
//     let productsCoupons: any = [];
//     switch (CouponExist.discountDepartment.key) {
//       case "allProducts":
//         productsCoupons = await Product.find({});
//         break;
//       case "products":
//         productsCoupons = CouponExist?.discountDepartment.value;
//         break;
//       case "categories":
//         productsCoupons = await Product.find({
//           category: [...CouponExist.discountDepartment.value],
//         });
//         break;
//       case "subcategories":
//         productsCoupons = await Product.find({
//           subcategory: [...CouponExist.discountDepartment.value],
//         });
//         break;
//       default:
//         break;
//     }
//     // 3- apply the coupon on the products
//     let totalForMarketer = 0;
//     const result: any = cart.cartItems.map((item) => {
//       const product = productsCoupons.find(
//         (product: IProduct) =>
//           product._id.toString() === item.product.toString()
//       );
//       if (product) {
//         totalForMarketer = totalForMarketer + (item.total * CouponExist.commissionMarketer / 100);
//         item.total = item.total - (item.total * CouponExist.discount) / 100;
//       }
//       return item;
//     });
//     // 4- update the cart
//     const output = await Cart.findByIdAndUpdate(
//       cart._id,
//       { cartItems: result, coupon: { couponReference: CouponExist._id, commissionMarketer: totalForMarketer, used: true } },
//       { new: true }
//     );
//     if (!output) {
//       return next(
//         new ApiError(
//           {
//             en: "Cart Not Found",
//             ar: "عربة التسوق غير موجودة",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }
//     // 5- response with the updated cart
//     res.status(StatusCodes.OK).json({
//       status: Status.SUCCESS,
//       data: output,
//       success_en: "Coupon Verified Successfully",
//       success_ar: "تم التحقق من الكوبون بنجاح",
//     });
//   } else if (CouponExist.type === "normal") {
//     // 1- get the coupon
//     const { coupon } = req.body;
//     // 2- check if the coupon is valid
//     const checkValidCoupon = await Coupon.findOne({
//       code: coupon,
//       endDate: { $gt: new Date() },
//       startDate: { $lt: new Date() },
//     });
//     if (!checkValidCoupon) {
//       return next(
//         new ApiError(
//           {
//             en: "Coupon Not Found Or Expired",
//             ar: "الكوبون غير موجود أو منتهي الصلاحية",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }
//     // 3- check if the coupon is used before
//     const checkUsedCoupon = await Coupon.findOne({
//       _id: checkValidCoupon._id,
//       "users.user": (req.user! as IUser)._id,
//     });
//     // 4- check if the cart used coupon before
//     const cart = await Cart.findOne({
//       user: (req.user! as IUser)._id,
//       "coupon.used": false,
//     });
//     if (!cart) {
//       return next(
//         new ApiError(
//           {
//             en: "That Cart Used Coupon Before",
//             ar: "عربة التسوق تم استخدام الكوبون بها من قبل",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }
//     // 5- check if the coupon limit is exceeded
//     if (!checkUsedCoupon) {
//       await Coupon.findOneAndUpdate(
//         { _id: checkValidCoupon._id },
//         {
//           $push: {
//             users: {
//               user: (req.user! as IUser)._id,
//               usedNumber: 1,
//             },
//           },
//         },
//         { new: true }
//       );
//     } else {
//       const result = await Coupon.findOneAndUpdate(
//         {
//           _id: checkValidCoupon._id,
//           "users.user": (req.user! as IUser)._id,
//           "users.usedNumber": { $lt: checkValidCoupon.limit },
//         },
//         {
//           $inc: {
//             "users.$.usedNumber": 1,
//           },
//         },
//         { new: true }
//       );
//       if (!result) {
//         return next(
//           new ApiError(
//             {
//               en: "Coupon Limit Exceeded",
//               ar: "تجاوز الحد الأقصى للكوبون",
//             },
//             StatusCodes.NOT_FOUND
//           )
//         );
//       }
//     }
//     // 6- collect all products that the coupon can be applied on
//     let productsCoupons: any = [];
//     switch (checkValidCoupon.discountDepartment.key) {
//       case "allProducts":
//         productsCoupons = await Product.find({});
//         break;
//       case "products":
//         productsCoupons = checkValidCoupon?.discountDepartment.value;
//         break;
//       case "categories":
//         productsCoupons = await Product.find({
//           category: [...checkValidCoupon.discountDepartment.value],
//         });
//         break;
//       case "subcategories":
//         productsCoupons = await Product.find({
//           subcategory: [...checkValidCoupon.discountDepartment.value],
//         });
//         break;
//       default:
//         break;
//     }
//     // 7- apply the coupon on the products
//     const result: any = cart.cartItems.map((item) => {
//       const product = productsCoupons.find(
//         (product: IProduct) =>
//           product._id.toString() === item.product.toString()
//       );
//       if (product) {
//         item.total =
//           item.total - (item.total * checkValidCoupon.discount) / 100;
//       }
//       return item;
//     });
//     // 8- update the cart
//     const output = await Cart.findByIdAndUpdate(
//       cart._id,
//       { cartItems: result, coupon: { couponReference: checkValidCoupon._id, used: true } },
//       { new: true }
//     );
//     if (!output) {
//       return next(
//         new ApiError(
//           {
//             en: "Cart Not Found",
//             ar: "عربة التسوق غير موجودة",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }
//     // 9- response with the updated cart
//     res.status(StatusCodes.OK).json({
//       status: Status.SUCCESS,
//       data: output,
//       success_en: "Coupon Verified Successfully",
//       success_ar: "تم التحقق من الكوبون بنجاح",
//     });
//   }
// });
