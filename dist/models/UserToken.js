"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserToken = void 0;
var mongoose_1 = require("mongoose");
exports.UserToken = (0, mongoose_1.model)('UserToken', new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
}, {
    timestamps: true,
}));
