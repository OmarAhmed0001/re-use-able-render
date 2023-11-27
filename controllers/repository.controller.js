"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRepositoriesForAllProducts = exports.shippingProduct = exports.updateProductInRepository = exports.deleteProductFromRepository = exports.addProductToRepository = exports.deleteRepository = exports.updateRepository = exports.createRepository = exports.getRepositoryById = exports.getAllRepositories = void 0;
const factory_controller_1 = require("./factory.controller");
const repository_model_1 = require("../models/repository.model");
const product_model_1 = require("../models/product.model");
const status_enum_1 = require("../interfaces/status/status.enum");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const order_model_1 = require("../models/order.model");
// import { IRepository } from "../interfaces/repository/repository.interface";
// @desc    Get All Repositories
// @route   POST /api/v1/repositories
// @access  Private (Admin)
exports.getAllRepositories = (0, factory_controller_1.getAllItems)(repository_model_1.Repository, [
    "products.productId",
]);
// @desc    Get Specific Repository By Id
// @route   Get /api/v1/repositories/:id
// @access  Private (Admin)
exports.getRepositoryById = (0, factory_controller_1.getOneItemById)(repository_model_1.Repository, [
    "products.productId",
]);
// @desc    Create a new repository
// @route   POST /api/v1/repositories
// @access  Private (Admin)
exports.createRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { name_en, name_ar, products, address } = req.body;
    // 2- validate products array
    if (!Array.isArray(products) || products.length === 0) {
        const repository = new repository_model_1.Repository({
            name_en,
            name_ar,
            quantity: 0,
            products,
            address,
        });
        const newRepository = await repository.save();
        // 6- send response
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            status: "success",
            data: newRepository,
            success_en: "Repository created successfully",
            success_ar: "تم إنشاء المستودع بنجاح",
        });
    }
    const repository = await repository_model_1.Repository.findOne({ name_ar, name_en });
    if (repository) {
        return next(new ApiError_1.default({
            en: "Repository name already exists",
            ar: "اسم المستودع موجود بالفعل",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // 4- calculate total quantity from product quantities
    const totalQuantity = products.reduce((total, product) => total + product.quantity, 0);
    // 5- create a new repository
    const newRepository = new repository_model_1.Repository({
        name_en,
        name_ar,
        quantity: totalQuantity,
        products,
        address,
    });
    const RepositoryResult = await newRepository.save();
    // 3- validate each product in the array
    for (const product of products) {
        const { productId, quantity } = product;
        if (!productId || !quantity || quantity < 0) {
            return next(new ApiError_1.default({
                en: "Invalid product data",
                ar: "بيانات المنتج غير صالحة",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        const eachProduct = await product_model_1.Product.findById(productId).exec();
        if (!eachProduct) {
            return next(new ApiError_1.default({
                en: "Product not found",
                ar: "المنتج غير موجود",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        //const=remainingQuantity= eachProduct.repoQuantity - productQuantity
        const remainingQuantity = eachProduct.quantity - eachProduct.repoQuantity;
        // if(remaining )
        if (quantity > remainingQuantity) {
            return next(new ApiError_1.default({
                en: "Quantity must be less than Product quantity",
                ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        //eachProduct.repoQuantity-=quanity;
        // eachProduct.repoQuantity += quantity;
        // await eachProduct.save();
        await product_model_1.Product.findByIdAndUpdate({ _id: productId }, {
            $inc: { repoQuantity: quantity },
            $addToSet: { repoIds: RepositoryResult._id },
        }, // Increment repoQuantity by the product quantity
        { new: true });
    }
    // 6- send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: "success",
        data: RepositoryResult,
        success_en: "Repository created successfully",
        success_ar: "تم إنشاء المستودع بنجاح",
    });
});
// @desc    Update Repository By Id
// @route   POST /api/v1/repositories/:id
// @access  Private (Admin)
exports.updateRepository = (0, factory_controller_1.updateOneItemById)(repository_model_1.Repository);
// @desc    Delete Repository By Id
// @route   POST /api/v1/repositories/:id
// @access  Private (Admin)
exports.deleteRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    const repositoryId = req.params.id;
    // Find the repository to be deleted
    const repository = await repository_model_1.Repository.findById(repositoryId)
        .populate("products.productId")
        .exec();
    if (!repository) {
        return next(new ApiError_1.default({
            en: "Repository not found",
            ar: "المستودع غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Loop through each product in the repository and update repoQuantity
    for (const product of repository.products) {
        const productId = product.productId._id;
        const productInschema = await product_model_1.Product.findById(productId);
        if (!productInschema) {
            return next(new ApiError_1.default({
                en: "Product not found",
                ar: "المنتج غير موجود",
            }, http_status_codes_1.StatusCodes.NOT_FOUND));
        }
        if (productInschema.quantity < 0) {
            return next(new ApiError_1.default({
                en: "Quantity must be greater than 0",
                ar: "يجب أن تكون الكمية أكبر من 0",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        if (productInschema.repoQuantity < product.quantity) {
            return next(new ApiError_1.default({
                en: "Quantity must be less than Product quantity",
                ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        if (productInschema.quantity < product.quantity) {
            return next(new ApiError_1.default({
                en: "Quantity must be less than Product quantity",
                ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
            }, http_status_codes_1.StatusCodes.BAD_REQUEST));
        }
        // Find the product and update repoQuantity
        await product_model_1.Product.findByIdAndUpdate(productId, { $inc: { repoQuantity: -product.quantity } }, // Decrement repoQuantity by the product quantity
        { new: true });
    }
    // Delete the repository
    await repository_model_1.Repository.deleteOne({ _id: repository._id });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: null,
        success_en: "Repository deleted successfully",
        success_ar: "تم حذف المستودع بنجاح",
    });
});
// @desc    Add Product To Repository By Id
// @route   POST /api/v1/repositories/:id/add-product
// @access  Private (Admin)
exports.addProductToRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    // 1- get data from body
    const { productId, quantity } = req.body;
    const repositoryId = req.params.id;
    console.log(productId, quantity, repositoryId);
    // 2- find repository by ID
    const repository = await repository_model_1.Repository.findById(repositoryId);
    if (!repository) {
        return next(new ApiError_1.default({
            en: "Repository not found",
            ar: "المستودع غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // 3- find product by ID
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    const remainingQuantity = product.quantity - product.repoQuantity;
    if (quantity > remainingQuantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.quantity < 0 || quantity < 0) {
        return next(new ApiError_1.default({
            en: "Quantity must be greater than 0",
            ar: "يجب أن تكون الكمية أكبر من 0",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // product.repoQuantity += quantity;
    // await product.save();
    await product_model_1.Product.findByIdAndUpdate({ _id: productId }, {
        $inc: { repoQuantity: quantity },
        $addToSet: { repoIds: repositoryId },
    }, // Increment repoQuantity by the product quantity
    { new: true });
    // 4- check if the product already exists in the repository
    const existingProduct = repository.products.find((item) => item.productId.toString() === product._id.toString());
    if (existingProduct) {
        //console.log('existingProduct ', existingProduct);
        // Update the quantity of the existing product and the repository
        existingProduct.quantity = +existingProduct.quantity + +quantity; // convert to numbers and add
        repository.quantity = +repository.quantity + +quantity;
    }
    else {
        //console.log('NewProduct ');
        // Add the product to the repository if it doesn't exist
        repository.products.push({
            productId,
            quantity,
        });
        repository.quantity = +repository.quantity + +quantity;
    }
    await repository.save();
    // 5- send response
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        status: status_enum_1.Status.SUCCESS,
        data: repository,
        success_en: "Product added to repository successfully",
        success_ar: "تمت إضافة المنتج إلى المستودع بنجاح",
    });
});
// @desc    Delete Product From Repository By Id
// @route   DELETE /api/v1/repositories/:id/products/:productId
// @access  Private (Admin)
exports.deleteProductFromRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    const repositoryId = req.params.id;
    const productId = req.params.productId;
    // Find the repository
    const repository = await repository_model_1.Repository.findById(repositoryId);
    if (!repository) {
        return next(new ApiError_1.default({
            en: "Repository not found",
            ar: "المستودع غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Find the product in the repository
    const productIndex = repository.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1) {
        return next(new ApiError_1.default({
            en: "Product not found in the repository",
            ar: "المنتج غير موجود في المستودع",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Get the product details
    const productDetails = repository.products[productIndex];
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (product.quantity < 0) {
        return next(new ApiError_1.default({
            en: "Quantity must be greater than 0",
            ar: "يجب أن تكون الكمية أكبر من 0",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.repoQuantity < productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.quantity < productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // Update the repoQuantity of the product
    await product_model_1.Product.findByIdAndUpdate(productId, { $inc: { repoQuantity: -productDetails.quantity } }, // Decrement repoQuantity by the product quantity
    { new: true });
    // Update the repository details
    repository.quantity -= productDetails.quantity;
    repository.products.splice(productIndex, 1);
    // Save the changes
    await repository.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: repository,
        success_en: "Product deleted from repository successfully",
        success_ar: "تم حذف المنتج من المستودع بنجاح",
    });
});
// @desc    Update Product In Repository By Id
// @route   PUT /api/v1/repositories/:id/products/:productId
// @access  Private (Admin)
exports.updateProductInRepository = (0, express_async_handler_1.default)(async (req, res, next) => {
    const repositoryId = req.params.id;
    const productId = req.params.productId;
    const { quantity } = req.body;
    // Find the repository
    const repository = await repository_model_1.Repository.findById(repositoryId);
    if (!repository) {
        return next(new ApiError_1.default({
            en: "Repository not found",
            ar: "المستودع غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Find the product in the repository
    const productIndex = repository.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1) {
        return next(new ApiError_1.default({
            en: "Product not found in the repository",
            ar: "المنتج غير موجود في المستودع",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Get the product details
    const productDetails = repository.products[productIndex];
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (product.quantity < 0 || quantity < 0) {
        return next(new ApiError_1.default({
            en: "Quantity must be greater than 0",
            ar: "يجب أن تكون الكمية أكبر من 0",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.repoQuantity < productDetails.quantity || quantity > productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.quantity < productDetails.quantity || quantity > productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // Update the repoQuantity of the product
    await product_model_1.Product.findByIdAndUpdate(productId, { $inc: { repoQuantity: -productDetails.quantity } }, // Decrement repoQuantity by the product quantity
    { new: true });
    // Update the repository details
    repository.quantity -= productDetails.quantity;
    const remainingQuantity = product.quantity - product.repoQuantity;
    if (quantity > remainingQuantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.quantity < 0 || quantity < 0) {
        return next(new ApiError_1.default({
            en: "Quantity must be greater than 0",
            ar: "يجب أن تكون الكمية أكبر من 0",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    repository.products[productIndex].quantity = quantity;
    repository.quantity += quantity;
    // Save the changes
    await repository.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: repository,
        success_en: "Product updated in repository successfully",
        success_ar: "تم تحديث المنتج في المستودع بنجاح",
    });
});
// @desc    Shipping Specific Product in Specific Repository
// @route   Post /api/v1/repositories/:id/products/:productId/shipping
// @access  Private (Admin)
exports.shippingProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const repositoryId = req.params.id;
    const productId = req.params.productId;
    const { quantity } = req.body;
    // Find the repository
    const repository = await repository_model_1.Repository.findById(repositoryId);
    if (!repository) {
        return next(new ApiError_1.default({
            en: "Repository not found",
            ar: "المستودع غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Find the product in the repository
    const productIndex = repository.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1) {
        return next(new ApiError_1.default({
            en: "Product not found in the repository",
            ar: "المنتج غير موجود في المستودع",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    // Get the product details
    const productDetails = repository.products[productIndex];
    const product = await product_model_1.Product.findById(productId);
    if (!product) {
        return next(new ApiError_1.default({
            en: "Product not found",
            ar: "المنتج غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    if (product.quantity < 0 || quantity < 0) {
        return next(new ApiError_1.default({
            en: "Quantity must be greater than 0",
            ar: "يجب أن تكون الكمية أكبر من 0",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.repoQuantity < productDetails.quantity || quantity > productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    if (product.quantity < productDetails.quantity || quantity > productDetails.quantity) {
        return next(new ApiError_1.default({
            en: "Quantity must be less than Product quantity",
            ar: "يجب أن تكون الكمية أقل من أو تساوي كمية المنتج",
        }, http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // Update the repoQuantity of the product
    await product_model_1.Product.findByIdAndUpdate(productId, {
        $inc: {
            repoQuantity: -productDetails.quantity,
            quantity: -productDetails.quantity,
        },
    }, // Decrement repoQuantity by the product quantity
    { new: true });
    // Update the repository details
    repository.quantity -= productDetails.quantity;
    repository.products[productIndex].quantity = quantity;
    repository.quantity += quantity;
    // Save the changes
    await repository.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: repository,
        success_en: "Product shipped from repository successfully",
        success_ar: "تم شحن المنتج من المستودع بنجاح",
    });
});
// @desc    Get All Repositories For All Products
// @route   POST /api/v1/repositories/allProduct/:orderId
// @access  Private (Admin)
exports.getAllRepositoriesForAllProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a, _b;
    // 1- get data from body
    const { id } = req.params;
    // 2- find order By Id
    const order = await order_model_1.Order.findById(id);
    if (!order) {
        return next(new ApiError_1.default({
            en: "Order not found",
            ar: "الطلب غير موجود",
        }, http_status_codes_1.StatusCodes.NOT_FOUND));
    }
    let onlineItems = (_a = order === null || order === void 0 ? void 0 : order.onlineItems) === null || _a === void 0 ? void 0 : _a.items;
    let cashItems = (_b = order === null || order === void 0 ? void 0 : order.cashItems) === null || _b === void 0 ? void 0 : _b.items;
    let productsWithReops = [];
    await Promise.all(onlineItems.map(async (item) => {
        const product = await product_model_1.Product.findById(item.product).populate("repoIds");
        if (product) {
            productsWithReops.push({
                productId: product._id,
                product_title_en: product.title_en,
                product_title_ar: product.title_ar,
                Repos: product.repoIds,
            });
        }
    }));
    await Promise.all(cashItems.map(async (item) => {
        const product = await product_model_1.Product.findById(item.product).populate("repoIds");
        if (product) {
            productsWithReops.push({
                productId: product._id,
                product_title_en: product.title_en,
                product_title_ar: product.title_ar,
                Repos: product.repoIds,
            });
        }
    }));
    // console.log("productsWithReops : ", productsWithReops[0].Repos);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        status: "success",
        data: productsWithReops,
        success_en: "Repositories retrieved successfully",
        success_ar: "تم استرجاع المستودعات بنجاح",
    });
});
