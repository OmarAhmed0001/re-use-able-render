"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithGoogle = void 0;
const googleAuth_1 = require("../utils/googleAuth");
exports.authenticateWithGoogle = googleAuth_1.googlePassport.authenticate('google', { scope: ['profile', 'email'] });
