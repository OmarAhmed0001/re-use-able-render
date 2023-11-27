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
exports.deleteAddressForLoggedUserById = exports.getAllAddressesForLoggedUser = exports.getLoggedUser = exports.deleteUserById = exports.addRole = exports.addAdmin = exports.updateLoggedUser = exports.getUserById = exports.getAllAdmins = exports.getAllUsers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = require("../models/user.model");
const user_interface_1 = require("../interfaces/user/user.interface");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const status_enum_1 = require("../interfaces/status/status.enum");
const ApiFeatures_1 = require("../utils/ApiFeatures");
const bcrypt_1 = __importDefault(require("bcrypt"));
const limitsUser_1 = require("../utils/limits/limitsUser");
// @desc     Get All Users
// @route    GET/api/v1/users
// @access   Private (Root) TODO: add the rest of the roles
exports.getAllUsers = (0, express_async_handler_1.default)(async (req, res, next) => {
    //  1- find all data
    const query = req.query;
    const mongoQuery = user_model_1.User.find({ role: "user" }).select("-password");
    // 2- create pagination
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
    // 3- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: data.length,
        paginationResult,
        data: data,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get All Users
// @route    GET/api/v1/users/getAllAdmins
// @access   Private
exports.getAllAdmins = (0, express_async_handler_1.default)(async (req, res, next) => {
    //  1- find all data
    const query = req.query;
    const users = user_model_1.User.find({
        role: {
            $in: [user_interface_1.Role.AdminA, user_interface_1.Role.AdminB, user_interface_1.Role.AdminC, user_interface_1.Role.SubAdmin],
        },
    }).select("-password");
    // 2- create pagination
    const { data, paginationResult } = await new ApiFeatures_1.ApiFeatures(users, query)
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        results: data.length,
        paginationResult,
        data: data,
        success_en: "found successfully",
        success_ar: "تم العثور بنجاح",
    });
});
// @desc     Get User By Id
// @route    GET/api/v1/users/:id
// @access   Private (Root) TODO: add the rest of the roles
exports.getUserById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_model_1.User.findOne({
        _id: id,
        role: {
            $ne: user_interface_1.Role.RootAdmin,
        },
    }).select("-password -changePasswordAt");
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: user,
        success_en: "User found successfully",
        success_ar: "تم العثور على المستخدم بنجاح",
    });
});
// @desc     Update Logged User
// @route    PUT/api/v1/users/:id
// @access   Private (Logged)
exports.updateLoggedUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1) check on password
    if (req.body.password)
        req.body.password = bcrypt_1.default.hashSync(req.body.password, bcrypt_1.default.genSaltSync(10));
    else if (!req.body.password)
        delete req.body.password;
    // 2) check on email
    if (req.body.email && !req.user.email) {
        const userExists = await user_model_1.User.findOne({
            email: req.body.email,
        });
        if (userExists) {
            return next(new ApiError_1.default({
                en: "This email used in another account",
                ar: "هذا البريد الإلكتروني مستخدم في حساب آخر",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
    }
    // 3) check on phone
    if (req.body.phone && !req.user.phone) {
        const userExists = await user_model_1.User.findOne({
            phone: req.body.phone,
        });
        if (userExists) {
            return next(new ApiError_1.default({
                en: "This phone used in another account",
                ar: "هذا الهاتف مستخدم في حساب آخر",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
    }
    const user = await user_model_1.User.findOneAndUpdate({ _id: req.user._id }, Object.assign({}, req.body), { new: true });
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: user,
        success_en: "User updated successfully",
        success_ar: "تم تحديث المستخدم بنجاح",
    });
});
// @desc     add admin with role
// @route    POST/api/v1/users/addAdmin
// @access   Private (Root)
exports.addAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get all data from body
    const { name, email, phone, password, role } = req.body;
    // 2- check if user exists
    const userExists = await user_model_1.User.findOne({
        $or: [{ email }, { phone }],
    });
    if (userExists) {
        return next(new ApiError_1.default({
            en: "User already exists",
            ar: "المستخدم موجود بالفعل",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 3- check on limit number of role
    const roleExist = await user_model_1.User.find({ role: role });
    if (roleExist.length === (0, limitsUser_1.limitedForAdmin)(role)) {
        return next(new ApiError_1.default({
            en: "You cannot add more to this role because reached to maximum limit",
            ar: "لا يمكنك اضافة المزيد من هذا الدور لانه وصل الحد الاقصي",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 4- create new user
    const user = await user_model_1.User.create({
        name,
        email,
        phone,
        password,
        role,
    });
    // 5- send response
    const _a = user.toObject(), { password: pass, changePasswordAt } = _a, rest = __rest(_a, ["password", "changePasswordAt"]);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: Object.assign({}, rest),
        success_en: "Admin added successfully",
        success_ar: "تم إضافة المشرف بنجاح",
    });
});
// @desc     Add Role To User
// @route    PUT/api/v1/users/:id/addRole
// @access   Private (Root)
exports.addRole = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;
    if (role === user_interface_1.Role.RootAdmin) {
        return next(new ApiError_1.default({
            en: "You can't add RootAdmin role",
            ar: "لا يمكنك إضافة دور RootAdmin",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // check on role
    const roleExist = await user_model_1.User.find({ role: role }).countDocuments();
    if (roleExist === (0, limitsUser_1.limitedForAdmin)(role)) {
        return next(new ApiError_1.default({
            en: "You cannot add more to this role because reached to maximum limit",
            ar: "لا يمكنك اضافة المزيد من هذا الدور لانه وصل الحد الاقصي",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    const user = await user_model_1.User.findOne({
        _id: id,
        role: {
            $ne: user_interface_1.Role.RootAdmin,
        },
    });
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    user.role = role;
    await user.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: user,
        success_en: "Role added successfully",
        success_ar: "تم إضافة الدور بنجاح",
    });
});
// @desc     Delete User By Id
// @route    DELETE/api/v1/users/:id
// @access   Private (Root) TODO: add the rest of the roles
exports.deleteUserById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const loggedRole = req.user.role;
    const wantDelete = await user_model_1.User.findById({ _id: id });
    if ((wantDelete === null || wantDelete === void 0 ? void 0 : wantDelete.role) === "adminA" && loggedRole === "adminB") {
        return next(new ApiError_1.default({
            en: "You can't delete this user",
            ar: "لا يمكنك حذف هذا المستخدم",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const user = await user_model_1.User.findOneAndDelete({
        _id: id,
        role: {
            $ne: user_interface_1.Role.RootAdmin,
        },
    });
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: null,
        success_en: "User deleted successfully",
        success_ar: "تم حذف المستخدم بنجاح",
    });
});
// @desc     Get Logged User
// @route    GET/api/v1/users/me
// @access   Private (User/Admins)
exports.getLoggedUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    const user = await user_model_1.User.findOne({ _id: req.user._id }).populate([
        {
            path: "pointsMarketer.order",
            model: "Order",
            select: "onlineItems cashItems totalPrice totalQuantity name email phone",
        },
    ]);
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    //   const clientIP =
    //   (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string);
    //   console.log('Client IP:', clientIP);
    //   const ip =clientIP.split(',')[0];
    //   console.log('Client Public IP:', ip);
    //  const clientIpData = geoip.lookup(ip);
    //  //const clientCountry = getCountryFromIP(clientIP);
    //  if (!clientIpData) {
    //   return next(
    //     new ApiError(
    //       { en: "clientIpData not found", ar: "بلد المستخدم غير موجودة" },
    //       StatusCodes.NOT_FOUND
    //     )
    //   );
    //   }
    //   console.log('Client Ip Data:', clientIpData);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        // ip:" "+ clientIP + " ",
        // clientCountry:clientIpData?.country ||"not found",
        data: user,
        success_en: "User found successfully",
        success_ar: "تم العثور على المستخدم بنجاح",
    });
});
// @desc     Get All Addresses For Logged User
// @route    GET/api/v1/users/getAllAddressesForLoggedUser
// @access   Private (User/Admins)
exports.getAllAddressesForLoggedUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    const addresses = await user_model_1.User.findById(req.user._id);
    if (!addresses) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (addresses.addressesList.length < 1) {
        return next(new ApiError_1.default({ en: "Addresses not found", ar: "العناوين غير موجودة" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        data: addresses.addressesList,
        success_en: "User found successfully",
        success_ar: "تم العثور على المستخدم بنجاح",
    });
});
// @desc     Delete Address For Logged User By Id
// @route    DELETE/api/v1/users/deleteAddressForLoggedUser/:id
// @access   Private (User/Admins)
exports.deleteAddressForLoggedUserById = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_model_1.User.findOneAndUpdate({ _id: req.user._id }, {
        $pull: { addressesList: { _id: id } },
    }, { new: true });
    if (!user) {
        return next(new ApiError_1.default({ en: "User not found", ar: "المستخدم غير موجود" }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: status_enum_1.Status.SUCCESS,
        success_en: "Address Delete Successfully",
        success_ar: "تم حذف العنوان بنجاح",
    });
});
