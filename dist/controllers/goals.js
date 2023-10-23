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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.remove = exports.create = exports.getAll = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Goals_1 = require("../models/Goals");
var createError_1 = require("../utils/createError");
var getAll = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var goals, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Goals_1.Goal.find()];
            case 1:
                goals = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        data: goals,
                        success: true,
                        message: "Goals list found.",
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
var create = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var goal, _id, createdGoal, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Goals_1.Goal.findOne({
                        name: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.name,
                    })];
            case 1:
                goal = _b.sent();
                if (goal) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Sustainable Development Goal already created."))];
                }
                return [4 /*yield*/, Goals_1.Goal.create(req === null || req === void 0 ? void 0 : req.body)];
            case 2:
                _id = (_b.sent())._id;
                return [4 /*yield*/, Goals_1.Goal.findById(_id)];
            case 3:
                createdGoal = _b.sent();
                if (!createdGoal) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Sustainable Development Goal not created."))];
                }
                return [2 /*return*/, res.status(201).json({
                        data: createdGoal,
                        success: true,
                        message: "Goal created successfully.",
                    })];
            case 4:
                error_2 = _b.sent();
                next(error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.create = create;
var remove = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var goal, objectId, deletedGoal, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Goals_1.Goal.findById(req.params.id)];
            case 1:
                goal = _a.sent();
                if (!goal) {
                    throw new Error("Sustainable Development Goal not found.");
                }
                objectId = new mongoose_1.default.Types.ObjectId(req.params.id);
                return [4 /*yield*/, Goals_1.Goal.findOneAndDelete(objectId)];
            case 2:
                deletedGoal = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: !!deletedGoal,
                        message: "Goal removed!",
                    })];
            case 3:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.remove = remove;
var update = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var goal, updatedGoal, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Goals_1.Goal.findById(req.params.id)];
            case 1:
                goal = _a.sent();
                if (!goal) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Sustainable Development Goal not found."))];
                }
                return [4 /*yield*/, Goals_1.Goal.findByIdAndUpdate(req.params.id, req.body, {
                        upsert: true,
                        returnOriginal: false,
                    })];
            case 2:
                updatedGoal = _a.sent();
                if (!updatedGoal) {
                    return [2 /*return*/, next((0, createError_1.createError)(404, "Sustainable Development Goal not updated."))];
                }
                return [2 /*return*/, res.status(200).json({
                        data: updatedGoal,
                        success: true,
                        message: "Goal updated!",
                    })];
            case 3:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
