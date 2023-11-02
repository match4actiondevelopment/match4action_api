"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CALLBACK_REDIRECT = exports.CLIENT_BASE_URL = exports.SALT = exports.REFRESH_TOKEN_PRIVATE_TIME = exports.REFRESH_TOKEN_PRIVATE_KEY = exports.ACCESS_TOKEN_PRIVATE_TIME = exports.ACCESS_TOKEN_PRIVATE_KEY = exports.COOKIE_KEY = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.MONGO_URI = exports.PORT = exports.ENVIRONMENT = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync('.env')) {
    dotenv_1.default.config({ path: '.env' });
}
else {
    console.error('.env file not found.');
}
exports.ENVIRONMENT = process.env.NODE_ENV;
var prod = exports.ENVIRONMENT === 'production';
exports.PORT = (process.env.PORT || 3003);
exports.MONGO_URI = prod ? process.env.MONGO_PROD : process.env.MONGO_LOCAL;
if (!exports.MONGO_URI) {
    if (prod) {
        console.error('No mongo connection string. Set MONGO_PROD environment variable.');
    }
    else {
        console.error('No mongo connection string. Set MONGO_LOCAL environment variable.');
    }
    process.exit(1);
}
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
exports.COOKIE_KEY = process.env.COOKIE_KEY;
exports.ACCESS_TOKEN_PRIVATE_KEY = (_a = process.env.ACCESS_TOKEN_PRIVATE_KEY) !== null && _a !== void 0 ? _a : '';
exports.ACCESS_TOKEN_PRIVATE_TIME = (_b = process.env.ACCESS_TOKEN_PRIVATE_TIME) !== null && _b !== void 0 ? _b : '10h';
exports.REFRESH_TOKEN_PRIVATE_KEY = (_c = process.env.REFRESH_TOKEN_PRIVATE_KEY) !== null && _c !== void 0 ? _c : '';
exports.REFRESH_TOKEN_PRIVATE_TIME = (_d = process.env.REFRESH_TOKEN_PRIVATE_TIME) !== null && _d !== void 0 ? _d : '7d';
exports.SALT = (_e = process.env.BCRYPT_SALT) !== null && _e !== void 0 ? _e : '10';
exports.CLIENT_BASE_URL = (_f = process.env.CLIENT_BASE_URL) !== null && _f !== void 0 ? _f : 'http://localhost:3000';
exports.GOOGLE_CALLBACK_REDIRECT = (_g = process.env.GOOGLE_CALLBACK_REDIRECT) !== null && _g !== void 0 ? _g : '/auth/google/redirect';
