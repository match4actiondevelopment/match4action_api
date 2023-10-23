"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
var createError = function (status, message) {
    var err = new Error();
    err.status = status;
    err.message = message;
    return err;
};
exports.createError = createError;
