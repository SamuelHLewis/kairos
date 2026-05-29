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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
var taskState;
(function (taskState) {
    taskState[taskState["notStarted"] = 0] = "notStarted";
    taskState[taskState["inProgress"] = 1] = "inProgress";
    taskState[taskState["done"] = 2] = "done";
})(taskState || (taskState = {}));
var taskPriority;
(function (taskPriority) {
    taskPriority[taskPriority["low"] = 0] = "low";
    taskPriority[taskPriority["high"] = 1] = "high";
})(taskPriority || (taskPriority = {}));
function readTask(taskFilePath) {
    const task_file_contents = fs.readFileSync(taskFilePath, 'utf8');
    // use a reviver function to automatically convert dates to Date type while parsing
    const task = JSON.parse(task_file_contents, (key, value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{3}$/;
        if (typeof value === 'string' && isoDateRegex.test(value)) {
            return new Date(value); // automatic date conversion
        }
        return value;
    });
    return task;
}
function createNewTask() {
    return __awaiter(this, void 0, void 0, function* () {
        const newTask = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'Name',
                message: 'Name of task:'
            },
            {
                type: 'input',
                name: 'Description',
                message: 'Description of task:'
            },
            {
                type: 'input',
                name: 'Due',
                message: 'Due date of task (in format YYYY-MM-DDTHH:MM:SS.SSS):'
            },
            {
                type: 'list',
                name: 'Priority',
                message: 'Priority level of task:',
                choices: ["low", "high"]
            },
            {
                type: 'list',
                name: 'State',
                message: 'Current state of task',
                choices: ["notStarted", "inProgress", "done"]
            }
        ]);
        return newTask;
    });
}
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        const { action } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: ['Create a new task', 'Edit an existing task']
            }
        ]);
        if (action === 'Create a new task') {
            const userTask = yield createNewTask();
            console.log("New task created");
            console.log(userTask);
        }
        else if (action === 'Edit an existing task') {
            "Yet to be implemented";
        }
    });
}
mainMenu();
