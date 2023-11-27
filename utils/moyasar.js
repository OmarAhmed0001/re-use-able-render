"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const moyasar_1 = __importDefault(require("moyasar"));
class Moyasar {
    constructor() {
        this.moyasar = new moyasar_1.default(process.env.MOYASAR_SECRET_KEY);
    }
    async createPayment(paymentOptions) {
        try {
            return await this.moyasar.payment.sendRequest("payments", "POST", paymentOptions);
        }
        catch (error) {
            console.log(`Error in creating payment: ${error}`.red);
            throw error;
        }
    }
    async getPayment(paymentId) {
        try {
            return await this.moyasar.payment.sendRequest(`payments/${paymentId}`, "GET");
        }
        catch (error) {
            console.log(`Error in getting payment: ${error}`.red);
            throw error;
        }
    }
    async createInvoice(invoiceOptions) {
        try {
            return await this.moyasar.invoice.sendRequest("invoices", "POST", invoiceOptions);
        }
        catch (error) {
            console.log(`Error in creating invoice: ${error}`.red);
            throw error;
        }
    }
    async getInvoice() { }
    async createRefund() { }
    async getList({ page, per }) {
        try {
            return await this.moyasar.payment.list({ page, per });
        }
        catch (error) {
            console.log(`Error in getting list of payments: ${error}`.red);
            throw error;
        }
    }
}
exports.default = Moyasar;
