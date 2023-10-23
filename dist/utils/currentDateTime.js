"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.giveCurrentDateTime = void 0;
var giveCurrentDateTime = function () {
    var today = new Date();
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDay();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + "-" + time;
    return dateTime;
};
exports.giveCurrentDateTime = giveCurrentDateTime;
