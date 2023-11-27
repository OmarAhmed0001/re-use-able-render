"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_router_1 = __importDefault(require("./routes/upload.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const category_router_1 = __importDefault(require("./routes/category.router"));
const product_router_1 = __importDefault(require("./routes/product.router"));
const contact_router_1 = __importDefault(require("./routes/contact.router"));
const subCategory_router_1 = __importDefault(require("./routes/subCategory.router"));
const section_router_1 = __importDefault(require("./routes/section.router"));
const cart_router_1 = __importDefault(require("./routes/cart.router"));
const order_router_1 = __importDefault(require("./routes/order.router"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const comment_router_1 = __importDefault(require("./routes/comment.router"));
const favorite_router_1 = __importDefault(require("./routes/favorite.router"));
const attribute_router_1 = __importDefault(require("./routes/attribute.router"));
const review_router_1 = __importDefault(require("./routes/review.router"));
const history_router_1 = __importDefault(require("./routes/history.router"));
const accounting_router_1 = __importDefault(require("./routes/accounting.router"));
const meta_router_1 = __importDefault(require("./routes/meta.router"));
const notification_router_1 = __importDefault(require("./routes/notification.router"));
const offer_router_1 = __importDefault(require("./routes/offer.router"));
const coupon_router_1 = __importDefault(require("./routes/coupon.router"));
const marketer_router_1 = __importDefault(require("./routes/marketer.router"));
const blog_router_1 = __importDefault(require("./routes/blog.router"));
const webhook_router_1 = __importDefault(require("./routes/webhook.router"));
const pointsManagment_router_1 = __importDefault(require("./routes/pointsManagment.router"));
const staticPointRequest_router_1 = __importDefault(require("./routes/staticPointRequest.router"));
const changeCurrency_router_1 = __importDefault(require("./routes/changeCurrency.router"));
const sendNewsViaEmailAndSMS_router_1 = __importDefault(require("./routes/sendNewsViaEmailAndSMS.router"));
const analyticsMeta_router_1 = __importDefault(require("./routes/analyticsMeta.router"));
const visitorHistory_router_1 = __importDefault(require("./routes/visitorHistory.router"));
const repository_router_1 = __importDefault(require("./routes/repository.router"));
const router = (0, express_1.Router)();
/*
allowedTo(
  Role.RootAdmin,
  Role.AdminA,
  Role.AdminB,
  Role.AdminC,
  Role.SubAdmin,
  Role.USER
),
*/
router.use("/upload", upload_router_1.default);
router.use("/cart", cart_router_1.default);
router.use("/orders", order_router_1.default);
router.use("/users", user_router_1.default);
router.use("/auth", auth_router_1.default);
router.use("/categories", category_router_1.default);
router.use("/products", product_router_1.default);
router.use("/contacts", contact_router_1.default);
router.use("/subCategories", subCategory_router_1.default);
router.use("/sections", section_router_1.default);
router.use("/favourites", favorite_router_1.default);
router.use("/attributes", attribute_router_1.default);
router.use("/reviews", review_router_1.default);
router.use("/comments", comment_router_1.default);
router.use("/history", history_router_1.default);
router.use("/accounting", accounting_router_1.default);
router.use("/meta", meta_router_1.default);
router.use("/notifications", notification_router_1.default);
router.use("/offers", offer_router_1.default);
router.use("/coupons", coupon_router_1.default);
router.use("/marketers", marketer_router_1.default);
router.use("/blogs", blog_router_1.default);
router.use('/webhook', webhook_router_1.default);
router.use('/points-management', pointsManagment_router_1.default);
router.use('/static-point-request', staticPointRequest_router_1.default);
router.use("/changeCurrency", changeCurrency_router_1.default);
router.use('/sendNews', sendNewsViaEmailAndSMS_router_1.default);
router.use('/analyticsMeta', analyticsMeta_router_1.default);
router.use('/visitorHistory', visitorHistory_router_1.default);
router.use('/repositories', repository_router_1.default);
exports.default = router;
