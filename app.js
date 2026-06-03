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
const taskIO_1 = require("./utils/taskIO");
const types_1 = require("./utils/types");
const display_1 = require("./utils/display");
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
                type: 'select',
                name: 'Priority',
                message: 'Priority level of task:',
                // only offer choices from the string values of the taskPriority
                choices: Object.keys(types_1.taskPriority).filter(k => isNaN(Number(k)))
            },
            {
                type: 'select',
                name: 'State',
                message: 'Current state of task',
                // only offer choices from the string values of the taskState
                choices: Object.keys(types_1.taskState).filter(k => isNaN(Number(k)))
            }
        ]);
        return newTask;
    });
}
function deleteTask() {
    return __awaiter(this, void 0, void 0, function* () {
        const { task } = yield inquirer_1.default.prompt([
            {
                type: 'select',
                name: 'task',
                message: 'Which task would you like to delete?',
                choices: (0, taskIO_1.listTaskNames)()
            }
        ]);
        const filename = `./tasks/${task.replace(/ /g, '-')}.json`;
        fs.unlinkSync(filename);
        console.log(`Task "${task}" deleted.`);
    });
}
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        const { action } = yield inquirer_1.default.prompt([
            {
                type: 'select',
                name: 'action',
                message: 'What would you like to do?',
                choices: ['Create a new task', 'Delete an existing task']
            }
        ]);
        if (action === 'Create a new task') {
            const userTask = yield createNewTask();
            const filename = `./tasks/${userTask.Name.replace(/ /g, '-')}.json`;
            fs.writeFileSync(filename, JSON.stringify(userTask, null, 2));
            console.log("New task created");
            console.log(userTask);
        }
        else if (action === 'Delete an existing task') {
            deleteTask();
        }
    });
}
// on launch, the current set of tasks are displayed
(0, display_1.displayEisenhowerMatrix)();
// User chooses to add new or edit existing
mainMenu();
