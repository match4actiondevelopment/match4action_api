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
exports.google = exports.refreshToken = exports.logout = exports.register = exports.login = void 0;
var jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
var uuidv4_1 = require("uuidv4");
var jwt_1 = require("../middleware/jwt");
var User_1 = require("../models/User");
var UserToken_1 = require("../models/UserToken");
var bcrypt_1 = require("../utils/bcrypt");
var createError_1 = require("../utils/createError");
var secrets_1 = require("../utils/secrets");
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var body, user, comparedPassword, access_token, refresh_token, userToken, addedUserToken, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                body = req === null || req === void 0 ? void 0 : req.body;
                return [4 /*yield*/, User_1.User.findOne({ email: body === null || body === void 0 ? void 0 : body.email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not found."))];
                }
                return [4 /*yield*/, (0, bcrypt_1.comparePasswords)(body === null || body === void 0 ? void 0 : body.password, user === null || user === void 0 ? void 0 : user.password)];
            case 2:
                comparedPassword = _a.sent();
                if (!comparedPassword) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Invalid email or password."))];
                }
                access_token = (0, jwt_1.signJwtAccessToken)({
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                });
                refresh_token = (0, jwt_1.signJwtRefreshToken)({
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                });
                userToken = new UserToken_1.UserToken({
                    token: refresh_token,
                    userId: user === null || user === void 0 ? void 0 : user._id,
                });
                return [4 /*yield*/, userToken.save()];
            case 3:
                addedUserToken = _a.sent();
                if (!addedUserToken) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Error creating refresh token."))];
                }
                user.password = undefined;
                return [2 /*return*/, res
                        .cookie("access_token", access_token, { httpOnly: true })
                        .cookie("refresh_token", refresh_token, { httpOnly: true })
                        .status(200)
                        .send({
                        data: user,
                        success: true,
                        message: "User logged successfully.",
                    })];
            case 4:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var register = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var body, newPassword, newUser, access_token, refresh_token, userToken, addedUserToken, error_2;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                body = req === null || req === void 0 ? void 0 : req.body;
                return [4 /*yield*/, (0, bcrypt_1.hashPassword)(body === null || body === void 0 ? void 0 : body.password)];
            case 1:
                newPassword = _d.sent();
                return [4 /*yield*/, User_1.User.create({
                        name: body === null || body === void 0 ? void 0 : body.name,
                        email: body === null || body === void 0 ? void 0 : body.email,
                        password: newPassword,
                        termsAndConditions: body === null || body === void 0 ? void 0 : body.termsAndConditions,
                        provider: {
                            id: (_b = (_a = body === null || body === void 0 ? void 0 : body.provider) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (0, uuidv4_1.uuid)(),
                            name: (_c = body === null || body === void 0 ? void 0 : body.provider) === null || _c === void 0 ? void 0 : _c.name,
                        },
                    })];
            case 2:
                newUser = _d.sent();
                access_token = (0, jwt_1.signJwtAccessToken)({
                    _id: newUser === null || newUser === void 0 ? void 0 : newUser._id,
                    email: newUser === null || newUser === void 0 ? void 0 : newUser.email,
                    role: newUser === null || newUser === void 0 ? void 0 : newUser.role,
                });
                refresh_token = (0, jwt_1.signJwtRefreshToken)({
                    _id: newUser === null || newUser === void 0 ? void 0 : newUser._id,
                    email: newUser === null || newUser === void 0 ? void 0 : newUser.email,
                    role: newUser === null || newUser === void 0 ? void 0 : newUser.role,
                });
                userToken = new UserToken_1.UserToken({
                    token: refresh_token,
                    userId: newUser === null || newUser === void 0 ? void 0 : newUser._id,
                });
                return [4 /*yield*/, userToken.save()];
            case 3:
                addedUserToken = _d.sent();
                if (!addedUserToken) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Error creating refresh token."))];
                }
                newUser.password = undefined;
                return [2 /*return*/, res
                        .cookie("access_token", access_token, { httpOnly: true })
                        .cookie("refresh_token", refresh_token, { httpOnly: true })
                        .status(201)
                        .send({
                        data: newUser,
                        success: true,
                        message: "User created successfully.",
                    })];
            case 4:
                error_2 = _d.sent();
                next(error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var logout = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, UserToken_1.UserToken.deleteMany({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })];
            case 1:
                _b.sent();
                req.logOut(function (err) {
                    if (err) {
                        return next(err);
                    }
                });
                return [2 /*return*/, res
                        .clearCookie("access_token", { sameSite: "none", secure: true })
                        .clearCookie("refresh_token", { sameSite: "none", secure: true })
                        .status(200)
                        .send({
                        success: true,
                        message: "User logout successfully.",
                    })];
            case 2:
                error_3 = _b.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.logout = logout;
var refreshToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, refreshToken_1, user, access_token, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                token = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
                return [4 /*yield*/, UserToken_1.UserToken.findOne({ token: token })];
            case 1:
                refreshToken_1 = _b.sent();
                if (!refreshToken_1) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Refresh token is not in database."))];
                }
                return [4 /*yield*/, User_1.User.findById(refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1.userId)];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User not found."))];
                }
                jsonwebtoken_1.default.verify(refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1.token, process.env.REFRESH_TOKEN_PRIVATE_KEY, function (err, _) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(err instanceof jsonwebtoken_1.TokenExpiredError)) return [3 /*break*/, 2];
                                return [4 /*yield*/, UserToken_1.UserToken.findByIdAndRemove(refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1._id, {
                                        useFindAndModify: false,
                                    }).exec()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, next((0, createError_1.createError)(403, "Unauthorized! Access Token was expired."))];
                            case 2:
                                if (!(err instanceof jsonwebtoken_1.NotBeforeError)) return [3 /*break*/, 4];
                                return [4 /*yield*/, UserToken_1.UserToken.findByIdAndRemove(refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1._id, {
                                        useFindAndModify: false,
                                    }).exec()];
                            case 3:
                                _a.sent();
                                return [2 /*return*/, next((0, createError_1.createError)(403, "Jwt not active."))];
                            case 4:
                                if (!(err instanceof jsonwebtoken_1.JsonWebTokenError)) return [3 /*break*/, 6];
                                return [4 /*yield*/, UserToken_1.UserToken.findByIdAndRemove(refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1._id, {
                                        useFindAndModify: false,
                                    }).exec()];
                            case 5:
                                _a.sent();
                                return [2 /*return*/, next((0, createError_1.createError)(403, "Jwt malformed."))];
                            case 6:
                                next();
                                return [2 /*return*/];
                        }
                    });
                }); });
                access_token = (0, jwt_1.signJwtAccessToken)({
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                });
                return [2 /*return*/, res
                        .cookie("access_token", access_token, { httpOnly: true })
                        .cookie("refresh_token", refreshToken_1 === null || refreshToken_1 === void 0 ? void 0 : refreshToken_1.token, { httpOnly: true })
                        .status(201)
                        .send({
                        success: true,
                        message: "Access token successfully refreshed.",
                    })];
            case 3:
                error_4 = _b.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.refreshToken = refreshToken;
var google = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, access_token, refresh_token, userToken, addedUserToken, url, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, User_1.User.findOne({ email: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.email })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.redirect("".concat(secrets_1.CLIENT_BASE_URL, "/404"))];
                }
                access_token = (0, jwt_1.signJwtAccessToken)({
                    _id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    role: user === null || user === void 0 ? void 0 : user.role,
                });
                refresh_token = (0, jwt_1.signJwtRefreshToken)({
                    _id: user === null || user === void 0 ? void 0 : user._id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    role: user === null || user === void 0 ? void 0 : user.role,
                });
                userToken = new UserToken_1.UserToken({
                    token: refresh_token,
                    userId: user === null || user === void 0 ? void 0 : user._id,
                });
                return [4 /*yield*/, userToken.save()];
            case 2:
                addedUserToken = _b.sent();
                if (!addedUserToken) {
                    return [2 /*return*/, res.redirect("".concat(secrets_1.CLIENT_BASE_URL, "/404"))];
                }
                url = new URL(secrets_1.CLIENT_BASE_URL);
                url.searchParams.set("access_token", access_token);
                url.searchParams.set("refresh_token", refresh_token);
                url.searchParams.set("user_id", user === null || user === void 0 ? void 0 : user._id);
                return [2 /*return*/, res
                        .cookie("access_token", access_token, {
                        httpOnly: true,
                    })
                        .cookie("refresh_token", refresh_token, {
                        httpOnly: true,
                    })
                        .redirect(url.toString())];
            case 3:
                error_5 = _b.sent();
                return [2 /*return*/, res.redirect("".concat(secrets_1.CLIENT_BASE_URL, "/404"))];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.google = google;
