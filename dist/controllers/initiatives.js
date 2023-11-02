"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.subscribe = exports.remove = exports.create = exports.getInitiativesByUser = exports.getOne = exports.getAll = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var upload_1 = require("../business/upload");
var Initiatives_1 = require("../models/Initiatives");
var createError_1 = require("../utils/createError");
var getAll = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var initiatives, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Initiatives_1.Initiative.find()];
            case 1:
                initiatives = _a.sent();
                return [2 /*return*/, res.status(200).send({
                        data: initiatives,
                        success: true,
                        message: "Initiatives list successfully found.",
                    })];
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
    var initiative, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Initiatives_1.Initiative.findById((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id)
                        .populate("goals", "name image")
                        .populate("userId", "name")];
            case 1:
                initiative = _b.sent();
                if (!initiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative not found."))];
                }
                return [2 /*return*/, res.status(200).send({
                        data: initiative,
                        success: true,
                        message: "Initiative successfully found.",
                    })];
            case 2:
                error_2 = _b.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOne = getOne;
var getInitiativesByUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, initiatives, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id);
                return [4 /*yield*/, Initiatives_1.Initiative.find({
                        userId: userId,
                    })
                        .populate("goals", "name image")
                        .populate("userId", "name")];
            case 1:
                initiatives = _b.sent();
                if (!initiatives) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "User initiatives not found."))];
                }
                return [2 /*return*/, res.status(200).send({
                        data: initiatives,
                        success: true,
                        message: "User initiatives successfully found.",
                    })];
            case 2:
                error_3 = _b.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getInitiativesByUser = getInitiativesByUser;
var create = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var endTime, _a, endTimeHour, endTimeMinutes, startTime, _b, startTimeHour, startTimeMinutes, image, uploadResponse, initiative, _id, createdInitiative, error_4;
    var _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 5, , 6]);
                endTime = new Date();
                _a = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.endTime.split(":"), endTimeHour = _a[0], endTimeMinutes = _a[1];
                endTime.setHours(endTimeHour);
                endTime.setMinutes(endTimeMinutes);
                startTime = new Date();
                _b = (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.startTime.split(":"), startTimeHour = _b[0], startTimeMinutes = _b[1];
                startTime.setHours(startTimeHour);
                startTime.setMinutes(startTimeMinutes);
                image = null;
                if (!(req === null || req === void 0 ? void 0 : req.file)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, upload_1.uploadBusiness)({
                        file: req === null || req === void 0 ? void 0 : req.file,
                        folderName: (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.folderName,
                    })];
            case 1:
                uploadResponse = _h.sent();
                if (!(uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.success)) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Error uploading image."))];
                }
                else {
                    image = uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.url;
                }
                _h.label = 2;
            case 2:
                initiative = new Initiatives_1.Initiative(__assign(__assign({}, req.body), { startTime: startTime, endTime: endTime, image: (_f = [image]) !== null && _f !== void 0 ? _f : null, userId: (_g = req === null || req === void 0 ? void 0 : req.user) === null || _g === void 0 ? void 0 : _g._id, whatMovesThisInitiative: JSON.parse(req.body.whatMovesThisInitiative), servicesNeeded: JSON.parse(req.body.servicesNeeded), whichAreasAreCoveredByThisInitiative: JSON.parse(req.body.whichAreasAreCoveredByThisInitiative), goals: JSON.parse(req.body.goals), location: JSON.parse(req.body.location) }));
                return [4 /*yield*/, initiative.save()];
            case 3:
                _id = (_h.sent())._id;
                return [4 /*yield*/, Initiatives_1.Initiative.findById(_id)];
            case 4:
                createdInitiative = _h.sent();
                if (!createdInitiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative not created."))];
                }
                return [2 /*return*/, res.status(201).send({
                        data: createdInitiative,
                        success: true,
                        message: "Initiative successfully created.",
                    })];
            case 5:
                error_4 = _h.sent();
                next(error_4);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.create = create;
var remove = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var objectId, initiative, deletedInitiative, error_5;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                objectId = new mongoose_1.default.Types.ObjectId(req.params.id);
                return [4 /*yield*/, Initiatives_1.Initiative.findById(objectId)];
            case 1:
                initiative = _c.sent();
                if (!initiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative not found."))];
                }
                if (((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id) !== ((_b = initiative === null || initiative === void 0 ? void 0 : initiative.userId) === null || _b === void 0 ? void 0 : _b.toString())) {
                    return [2 /*return*/, next((0, createError_1.createError)(403, "You can delete only your initiatives."))];
                }
                return [4 /*yield*/, Initiatives_1.Initiative.findOneAndDelete(objectId)];
            case 2:
                deletedInitiative = _c.sent();
                return [2 /*return*/, res.status(200).json({
                        success: !!deletedInitiative,
                        message: "Initiative successfully removed",
                    })];
            case 3:
                error_5 = _c.sent();
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.remove = remove;
var subscribe = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, initiative, updateInitiative, updatedInitiative, error_6;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                id = new mongoose_1.default.Types.ObjectId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id);
                return [4 /*yield*/, Initiatives_1.Initiative.findById(id)];
            case 1:
                initiative = _c.sent();
                if (!initiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative not found."))];
                }
                updateInitiative = new Initiatives_1.Initiative(initiative);
                updateInitiative.applicants = __spreadArray([
                    (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id
                ], updateInitiative.applicants, true);
                return [4 /*yield*/, Initiatives_1.Initiative.findByIdAndUpdate(id, updateInitiative, {
                        upsert: true,
                        returnOriginal: false,
                    })];
            case 2:
                updatedInitiative = _c.sent();
                if (!updatedInitiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative subscription not updated."))];
                }
                return [2 /*return*/, res.status(200).json({
                        data: updatedInitiative,
                        success: true,
                        message: "Initiative subscription successfully updated",
                    })];
            case 3:
                error_6 = _c.sent();
                next(error_6);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.subscribe = subscribe;
var update = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, initiative, endTime, _a, endTimeHour, endTimeMinutes, startTime, _b, startTimeHour, startTimeMinutes, image, uploadResponse, updateInitiative, updatedInitiative, error_7;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    return __generator(this, function (_1) {
        switch (_1.label) {
            case 0:
                _1.trys.push([0, 5, , 6]);
                id = new mongoose_1.default.Types.ObjectId((_c = req === null || req === void 0 ? void 0 : req.params) === null || _c === void 0 ? void 0 : _c.id);
                return [4 /*yield*/, Initiatives_1.Initiative.findById(id)];
            case 1:
                initiative = _1.sent();
                if (((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d._id) !== ((_e = initiative === null || initiative === void 0 ? void 0 : initiative.userId) === null || _e === void 0 ? void 0 : _e.toString())) {
                    return [2 /*return*/, next((0, createError_1.createError)(403, "You can update only your initiatives."))];
                }
                endTime = new Date();
                _a = (_g = (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.endTime) === null || _g === void 0 ? void 0 : _g.split(":"), endTimeHour = _a[0], endTimeMinutes = _a[1];
                endTime.setHours(endTimeHour);
                endTime.setMinutes(endTimeMinutes);
                startTime = new Date();
                _b = (_j = (_h = req === null || req === void 0 ? void 0 : req.body) === null || _h === void 0 ? void 0 : _h.startTime) === null || _j === void 0 ? void 0 : _j.split(":"), startTimeHour = _b[0], startTimeMinutes = _b[1];
                startTime.setHours(startTimeHour);
                startTime.setMinutes(startTimeMinutes);
                image = null;
                if (!(req === null || req === void 0 ? void 0 : req.file)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, upload_1.uploadBusiness)({
                        file: req === null || req === void 0 ? void 0 : req.file,
                        folderName: (_k = req === null || req === void 0 ? void 0 : req.body) === null || _k === void 0 ? void 0 : _k.folderName,
                    })];
            case 2:
                uploadResponse = _1.sent();
                if (!(uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.success)) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Error uploading image."))];
                }
                else {
                    image = uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.url;
                }
                _1.label = 3;
            case 3:
                updateInitiative = new Initiatives_1.Initiative(initiative);
                updateInitiative.endTime = endTime !== null && endTime !== void 0 ? endTime : initiative === null || initiative === void 0 ? void 0 : initiative.endTime;
                updateInitiative.startTime = startTime !== null && startTime !== void 0 ? startTime : initiative === null || initiative === void 0 ? void 0 : initiative.startTime;
                updateInitiative.goals = (_l = JSON.parse(req.body.goals)) !== null && _l !== void 0 ? _l : initiative === null || initiative === void 0 ? void 0 : initiative.endTime;
                updateInitiative.location =
                    (_m = JSON.parse(req.body.location)) !== null && _m !== void 0 ? _m : initiative === null || initiative === void 0 ? void 0 : initiative.location;
                updateInitiative.servicesNeeded =
                    (_o = JSON.parse(req.body.servicesNeeded)) !== null && _o !== void 0 ? _o : initiative === null || initiative === void 0 ? void 0 : initiative.servicesNeeded;
                updateInitiative.whatMovesThisInitiative =
                    (_p = JSON.parse(req.body.whatMovesThisInitiative)) !== null && _p !== void 0 ? _p : initiative === null || initiative === void 0 ? void 0 : initiative.whatMovesThisInitiative;
                updateInitiative.whichAreasAreCoveredByThisInitiative =
                    (_q = JSON.parse(req.body.whichAreasAreCoveredByThisInitiative)) !== null && _q !== void 0 ? _q : initiative === null || initiative === void 0 ? void 0 : initiative.whichAreasAreCoveredByThisInitiative;
                updateInitiative.image = (_r = [image]) !== null && _r !== void 0 ? _r : initiative === null || initiative === void 0 ? void 0 : initiative.image;
                updateInitiative.website = (_s = req.body.website) !== null && _s !== void 0 ? _s : initiative === null || initiative === void 0 ? void 0 : initiative.website;
                updateInitiative.applicants = (_t = initiative === null || initiative === void 0 ? void 0 : initiative.applicants) !== null && _t !== void 0 ? _t : [];
                updateInitiative.eventItemFrame =
                    (_u = req.body.eventItemFrame) !== null && _u !== void 0 ? _u : initiative === null || initiative === void 0 ? void 0 : initiative.eventItemFrame;
                updateInitiative.eventItemType =
                    (_v = req.body.eventItemType) !== null && _v !== void 0 ? _v : initiative === null || initiative === void 0 ? void 0 : initiative.eventItemType;
                updateInitiative.initiativeName =
                    (_w = req.body.initiativeName) !== null && _w !== void 0 ? _w : initiative === null || initiative === void 0 ? void 0 : initiative.initiativeName;
                updateInitiative.description =
                    (_x = req.body.description) !== null && _x !== void 0 ? _x : initiative === null || initiative === void 0 ? void 0 : initiative.description;
                updateInitiative.startDate = (_y = req.body.startDate) !== null && _y !== void 0 ? _y : initiative === null || initiative === void 0 ? void 0 : initiative.startDate;
                updateInitiative.endDate = (_z = req.body.endDate) !== null && _z !== void 0 ? _z : initiative === null || initiative === void 0 ? void 0 : initiative.endDate;
                updateInitiative.postalCode = (_0 = req.body.postalCode) !== null && _0 !== void 0 ? _0 : initiative === null || initiative === void 0 ? void 0 : initiative.postalCode;
                return [4 /*yield*/, Initiatives_1.Initiative.findByIdAndUpdate(id, updateInitiative, {
                        upsert: true,
                        returnOriginal: false,
                    })];
            case 4:
                updatedInitiative = _1.sent();
                if (!updatedInitiative) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Initiative not updated."))];
                }
                return [2 /*return*/, res.status(200).send({
                        data: updatedInitiative,
                        success: true,
                        message: "Initiative successfully updated.",
                    })];
            case 5:
                error_7 = _1.sent();
                next(error_7);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
