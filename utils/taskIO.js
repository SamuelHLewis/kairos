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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTask = readTask;
exports.loadTasks = loadTasks;
exports.listTaskNames = listTaskNames;
const fs = __importStar(require("fs"));
const types_1 = require("./types");
function readTask(taskFilePath) {
    const task_file_contents = fs.readFileSync(taskFilePath, 'utf8');
    // use a reviver function to automatically convert dates to Date type while parsing
    // also convert Priority level strings to enum types, handling case differences
    const task = JSON.parse(task_file_contents, (key, value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
        if (typeof value === 'string' && isoDateRegex.test(value)) {
            return new Date(value); // automatic date conversion
        }
        else if (typeof value === 'string' && value.toLowerCase() in types_1.taskPriority) {
            return types_1.taskPriority[value.toLowerCase()];
        }
        return value;
    });
    return task;
}
function loadTasks(taskDir) {
    let tasks = [];
    const taskPaths = fs.readdirSync(taskDir).filter(f => fs.statSync(`./tasks/${f}`).isFile());
    for (let taskPath of taskPaths) {
        tasks.push(readTask(`./tasks/${taskPath}`));
    }
    return tasks;
}
function listTaskNames() {
    let tasks = loadTasks('./tasks');
    let taskNames = [];
    for (let task of tasks) {
        taskNames.push(task.Name);
    }
    return taskNames;
}
