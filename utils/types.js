"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskPriority = exports.taskState = void 0;
var taskState;
(function (taskState) {
    taskState[taskState["notStarted"] = 0] = "notStarted";
    taskState[taskState["inProgress"] = 1] = "inProgress";
    taskState[taskState["done"] = 2] = "done";
})(taskState || (exports.taskState = taskState = {}));
var taskPriority;
(function (taskPriority) {
    taskPriority[taskPriority["low"] = 0] = "low";
    taskPriority[taskPriority["high"] = 1] = "high";
})(taskPriority || (exports.taskPriority = taskPriority = {}));
