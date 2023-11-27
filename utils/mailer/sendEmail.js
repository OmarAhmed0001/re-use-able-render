"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs = __importStar(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
// const emailReceivers = ["is1521@fayoum.edu.eg", "oa1476@fayoum.edu.eg"];
const subject = "Hello from Reuseable Store";
const invoiceName = (0, uuid_1.v4)();
const sendEmail = async (Order) => {
    try {
        // 1) Create a PDF
        const emailTemplate = createEmailTemplate(Order);
        const outputPath = `./uploads/invoice/${invoiceName}.pdf`;
        await takePDFOfHTML(emailTemplate, outputPath);
        // 2) Send Email
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: '"Reuseable Store" <eslamgalal0312@gmail.com>',
            to: Order.email,
            subject: subject,
            text: "Please find the attached PDF and HTML files.",
            html: emailTemplate,
            attachments: [
                {
                    filename: "invoice.pdf",
                    path: outputPath,
                },
            ],
        };
        console.log("Email Sent");
        return transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.error(err);
    }
};
exports.sendEmail = sendEmail;
const createEmailTemplate = (Order) => {
    const templateSource = fs.readFileSync(path.join(__dirname, 'sendEmail.html'));
    const template = handlebars_1.default.compile(templateSource.toString());
    handlebars_1.default.registerHelper("multiply", function (a, b) {
        return a * b;
    });
    const orderItems = Order.onlineItems.items.concat(Order.cashItems.items); // Combine the items
    console.log("orderItems", orderItems);
    // Create a new array with "own" properties
    const modifiedOrderItems = orderItems.map((item) => ({
        productName: item.product.title_en,
        price: item.product.finalPrice,
        quantity: item.quantity,
        total: item.quantity * item.product.finalPrice,
    }));
    console.log("modifiedOrderItems", modifiedOrderItems);
    const options = { allowProtoMethodsByDefault: true };
    return template({
        orderItems: modifiedOrderItems,
        totalPrice: Order.totalPrice,
        invoiceNumber: invoiceName,
        name: Order.name,
        address: Order.address,
        area: Order.area,
        city: Order.city,
        postalCode: Order.postalCode,
    }, options);
};
async function takePDFOfHTML(htmlContent, outputPath) {
    const browser = await puppeteer_1.default.launch({
        headless: "new", // Opt in to the new headless mode
    });
    const page = await browser.newPage();
    try {
        // Your existing code here
        await page.setContent(htmlContent);
        // Generate the PDF with the desired options
        await page.pdf({
            path: outputPath,
            format: "A4",
            printBackground: true,
        });
    }
    catch (error) {
        console.error("Error capturing PDF:", error);
    }
    finally {
        await browser.close();
    }
}
