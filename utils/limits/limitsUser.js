"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitedForAdmin = void 0;
const roles = {
    rootAdmin: { limit: 1 },
    adminA: { limit: 5 },
    adminB: { limit: 5 },
    adminC: { limit: 5 },
    subAdmin: { limit: 5 },
    user: { limit: 1 },
    guest: { limit: 1 },
    marketer: { limit: 1 },
};
const limitedForAdmin = (role) => {
    var _a;
    return ((_a = roles[role]) === null || _a === void 0 ? void 0 : _a.limit) || 0;
};
exports.limitedForAdmin = limitedForAdmin;
