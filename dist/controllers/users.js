"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.profile = exports.remove = exports.getOne = exports.getAll = void 0;
var User_1 = require("../models/User");
var createError_1 = require("../utils/createError");
var getAll = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User_1.User.find().select("-password")];
            case 1:
                users = _a.sent();
                return [2 /*return*/, res
                        .status(200)
                        .json({ success: true, data: users, message: "User list found." })];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAll = getAll;
var getOne = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User_1.User.findById(req.params.id)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not found."))];
                }
                return [2 /*return*/, res.status(200).json({ success: true, message: "User found." })];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOne = getOne;
var remove = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, error_3;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                id = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, User_1.User.findById(id)];
            case 1:
                user = _d.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not found."))];
                }
                if (((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id) !== ((_c = user === null || user === void 0 ? void 0 : user._id) === null || _c === void 0 ? void 0 : _c.toString())) {
                    return [2 /*return*/, next((0, createError_1.createError)(403, "You can delete only your account."))];
                }
                return [4 /*yield*/, User_1.User.findByIdAndDelete(id)];
            case 2:
                _d.sent();
                return [2 /*return*/, res.status(200).send({
                        success: true,
                        message: "User account removed!",
                    })];
            case 3:
                error_3 = _d.sent();
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.remove = remove;
var profile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User_1.User.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User profile not found."))];
                }
                user.password = undefined;
                return [2 /*return*/, res
                        .status(200)
                        .json({ success: true, data: user, message: "User profile found." })];
            case 2:
                error_4 = _b.sent();
                next(error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.profile = profile;
var update = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, updateUser, newUser, error_5;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __generator(this, function (_q) {
        switch (_q.label) {
            case 0:
                _q.trys.push([0, 3, , 4]);
                return [4 /*yield*/, User_1.User.findById(req.params.id)];
            case 1:
                user = _q.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not found."))];
                }
                if (((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id) !== ((_b = user === null || user === void 0 ? void 0 : user._id) === null || _b === void 0 ? void 0 : _b.toString())) {
                    return [2 /*return*/, next((0, createError_1.createError)(403, "You can update only your account."))];
                }
                updateUser = new User_1.User(user);
                updateUser.bio = (_d = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.bio) !== null && _d !== void 0 ? _d : user === null || user === void 0 ? void 0 : user.bio;
                updateUser.location = (_f = (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.location) !== null && _f !== void 0 ? _f : user === null || user === void 0 ? void 0 : user.location;
                updateUser.role = (_h = (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.role) !== null && _h !== void 0 ? _h : user === null || user === void 0 ? void 0 : user.role;
                updateUser.birthDate = (_k = (_j = req === null || req === void 0 ? void 0 : req.body) === null || _j === void 0 ? void 0 : _j.birthDate) !== null && _k !== void 0 ? _k : user === null || user === void 0 ? void 0 : user.birthDate;
                updateUser.name = (_m = (_l = req === null || req === void 0 ? void 0 : req.body) === null || _l === void 0 ? void 0 : _l.name) !== null && _m !== void 0 ? _m : user === null || user === void 0 ? void 0 : user.name;
                updateUser.image = (_p = (_o = req === null || req === void 0 ? void 0 : req.body) === null || _o === void 0 ? void 0 : _o.image) !== null && _p !== void 0 ? _p : user === null || user === void 0 ? void 0 : user.image;
                return [4 /*yield*/, User_1.User.findByIdAndUpdate(req.params.id, updateUser, {
                        upsert: true,
                        returnOriginal: false,
                    })];
            case 2:
                newUser = _q.sent();
                if (!newUser) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not updated."))];
                }
                return [2 /*return*/, res
                        .status(200)
                        .send({ success: true, data: newUser, message: "User updated." })];
            case 3:
                error_5 = _q.sent();
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
