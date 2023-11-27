"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMSTaqnyat = void 0;
const axios_1 = __importDefault(require("axios"));
const sendSMSTaqnyat = async (text) => {
    const data = {
        recipients: [text.recipient],
        body: `${text.code} :مرحبا بكم في متاجر صاري رمز الدخول هو`,
        sender: "SarriTech",
        deleteId: 3242424,
    };
    console.log("data: ", data);
    const headers = {
        Authorization: `Bearer ${process.env.TAQNYAT_API_KEY}`,
        "Content-Type": "application/json",
    };
    await axios_1.default.post("https://api.taqnyat.sa/v1/messages", data, { headers });
};
exports.sendSMSTaqnyat = sendSMSTaqnyat;
