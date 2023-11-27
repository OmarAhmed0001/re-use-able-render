"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Logex {
    constructor() {
        this.api_key = process.env.LOGEX_API_KEY;
        this.client = axios_1.default.create({
            baseURL: process.env.LOGEX_URL,
            headers: {
                Authorization: `Bearer ${this.api_key}`,
            },
        });
    }
    async createOrder(order) {
        var _a, _b, _c, _d;
        if (order.status === "initiated" || !order.isVerified) {
            throw new Error("Order is not verified");
        }
        // TODO:make sure that the order has populated items
        const products = [
            ...order.onlineItems.items.map((item) => item),
            ...order.cashItems.items.map((item) => item),
        ];
        const data = {
            order_id: order._id,
            dropShipping: {
                products: products
                    .filter((item) => item.product.deliveryType === "dropshipping")
                    .map((item) => {
                    var _a;
                    return ({
                        title_en: item.product.title_en,
                        title_ar: item.product.title_ar,
                        image: ((_a = item.product.imagesUrl) === null || _a === void 0 ? void 0 : _a[0]) || "image.png",
                        weight: item.product.weight,
                        deliveryType: item.product.deliveryType,
                        paymentType: item.product.paymentType,
                        properties: item.properties,
                        quantity: item.quantity,
                        price: item.totalPrice,
                    });
                }),
            },
            normal: {
                products: products
                    .filter((item) => item.product.deliveryType === "normal")
                    .map((item) => {
                    var _a;
                    return ({
                        title_en: item.product.title_en,
                        title_ar: item.product.title_ar,
                        quantity: item.quantity,
                        properties: item.properties,
                        image: ((_a = item.product.imagesUrl) === null || _a === void 0 ? void 0 : _a[0]) || "image.png",
                        weight: item.product.weight,
                        deliveryType: item.product.deliveryType,
                        paymentType: item.product.paymentType,
                        price: item.totalPrice,
                    });
                }),
            },
            receiver: {
                name: order === null || order === void 0 ? void 0 : order.name,
                phone: order === null || order === void 0 ? void 0 : order.phone,
                information: {
                    area: order === null || order === void 0 ? void 0 : order.area,
                    city: order === null || order === void 0 ? void 0 : order.city,
                    address: order === null || order === void 0 ? void 0 : order.address,
                    postalCode: order === null || order === void 0 ? void 0 : order.postalCode,
                },
            },
            price: ((_b = (_a = order === null || order === void 0 ? void 0 : order.cashItems) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (_c = order === null || order === void 0 ? void 0 : order.cashItems) === null || _c === void 0 ? void 0 : _c.totalPrice : 0,
            quantity: order === null || order === void 0 ? void 0 : order.totalQuantity,
        };
        try {
            const res = await this.client.post("/orders", data);
            return res === null || res === void 0 ? void 0 : res.data;
        }
        catch (error) {
            return (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data;
        }
    }
    async getOrders() {
        var _a;
        try {
            const res = await this.client.get("/orders");
            return res === null || res === void 0 ? void 0 : res.data;
        }
        catch (error) {
            return (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
        }
    }
    async trackOrder(orderNumberTracking) {
        var _a;
        try {
            const res = await this.client.get(`/orders/trackOrder/${orderNumberTracking}`);
            return res === null || res === void 0 ? void 0 : res.data;
        }
        catch (error) {
            return (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
        }
    }
    async trackOrderStatus(order_id) {
        var _a;
        try {
            const res = await this.client.get(`orders/trackOrder/${order_id}`);
            return res === null || res === void 0 ? void 0 : res.data;
        }
        catch (error) {
            return (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
        }
    }
}
exports.default = Logex;
