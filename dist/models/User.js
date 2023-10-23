"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var UserRole;
(function (UserRole) {
    UserRole[UserRole["volunteer"] = 0] = "volunteer";
    UserRole[UserRole["admin"] = 1] = "admin";
    UserRole[UserRole["organization"] = 2] = "organization";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var userSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
    },
    image: {
        type: String,
    },
    birthDate: {
        type: Date,
    },
    role: {
        type: String,
        enum: UserRole,
        default: 'volunteer',
    },
    bio: {
        type: String,
    },
    provider: {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },
    location: {
        country: {
            type: String,
        },
        city: {
            type: String,
        },
    },
    answers: {},
    termsAndConditions: { type: Boolean },
}, {
    timestamps: true,
});
exports.User = mongoose_1.default.model('User', userSchema);
