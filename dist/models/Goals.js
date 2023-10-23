"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = exports.GoalsEnum = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var GoalsEnum;
(function (GoalsEnum) {
    GoalsEnum["GOAL_1"] = "No Poverty";
    GoalsEnum["GOAL_2"] = "Zero Hunger";
    GoalsEnum["GOAL_3"] = "Good Health and Well-being";
    GoalsEnum["GOAL_4"] = "Quality Education";
    GoalsEnum["GOAL_5"] = "Gender Equality";
    GoalsEnum["GOAL_6"] = "Clean Water and Sanitation";
    GoalsEnum["GOAL_7"] = "Affordable and Clean Energy";
    GoalsEnum["GOAL_8"] = "Decent Work and Economic Growth";
    GoalsEnum["GOAL_9"] = "Industry, Innovation and Infrastructure";
    GoalsEnum["GOAL_10"] = "Reduced Inequality";
    GoalsEnum["GOAL_11"] = "Sustainable Cities and Communities";
    GoalsEnum["GOAL_12"] = "Responsible Consumption and Production";
    GoalsEnum["GOAL_13"] = "Climate Action";
    GoalsEnum["GOAL_14"] = "Life Below Water";
    GoalsEnum["GOAL_15"] = "Life on Land";
    GoalsEnum["GOAL_16"] = "Peace and Justice Strong Institutions";
    GoalsEnum["GOAL_17"] = "Partnerships to achieve the Goal";
})(GoalsEnum = exports.GoalsEnum || (exports.GoalsEnum = {}));
var goalSchema = new Schema({
    name: {
        type: String,
        enum: Object.values(GoalsEnum),
        required: true,
        unique: true,
    },
    order: {
        type: Number,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.Goal = mongoose_1.default.model("Goal", goalSchema);
