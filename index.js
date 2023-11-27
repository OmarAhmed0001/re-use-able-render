"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: "./config/config.env" });
const db_connection_1 = __importDefault(require("./config/db_connection"));
const morgan_1 = __importDefault(require("morgan"));
const mount_1 = __importDefault(require("./mount"));
require("colors");
const globalError_middleware_1 = require("./middlewares/globalError.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const cronSchedule_1 = require("./utils/cronSchedule");
// Socketio
const io_connection_1 = require("./config/io_connection"); // Import the socket initialization function
const http_1 = __importDefault(require("http"));
exports.app = (0, express_1.default)();
const server = http_1.default.createServer(exports.app);
// const ser=https.createServer({
//   key:fs.readFileSync(path.join(__dirname,'../../../../../etc/letsencrypt/live/saritestsecond.online/privkey.pem')),
//   cert:fs.readFileSync(path.join(__dirname,'../../../../../etc/letsencrypt/live/saritestsecond.online/cert.pem')),
// },app)
// app.use(
// 	cookieSession({
// 		name: "session",
// 		keys: ["cyberwolve"],
// 		maxAge: 24 * 60 * 60 * 100,
// 	})
// );
const NODE_ENV = process.env.NODE_ENV || "dev";
if (NODE_ENV === "dev") {
    exports.app.use((0, morgan_1.default)("dev"));
}
(0, db_connection_1.default)();
cronSchedule_1.closeAllCouponsThatEnded.start();
cronSchedule_1.RemoveAllGuestUsers.start();
cronSchedule_1.closeAllOffersThatEnded.start();
cronSchedule_1.updateExchangeRates.start();
const PORT = process.env.PORT || 3000;
//middlewares
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use("/uploads", express_1.default.static("./uploads"));
// routes
exports.app.use("/api/v1", mount_1.default);
// app.use(
// 	cors({
// 		origin: "http://localhost:3000",
// 		methods: "GET,POST,PUT,DELETE",
// 		credentials: true,
// 	})
// );
// un handled routes (not found)
exports.app.use("*", (0, express_async_handler_1.default)(async (req, res, next) => {
    next(new ApiError_1.default({
        en: `this path ${req.originalUrl} not found`,
        ar: `هذا المسار ${req.originalUrl} غير موجود`,
    }, http_status_codes_1.StatusCodes.NOT_FOUND));
}));
exports.app.use(globalError_middleware_1.globalErrorMiddleware);
// Socket.io
// Create a new HTTP server
// const server = http.createServer(app);
exports.io = (0, io_connection_1.initSocket)(server); // Initialize Socket.io and pass the server instance
// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server running:  ${process.env.APP_URL}`.green.bold);
});
