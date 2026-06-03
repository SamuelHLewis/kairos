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
// set the threshold for urgency in days here
const urgentThreshold = 3;
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
    // also convert Priority level strings to enum types, handling case differences
    const task = JSON.parse(task_file_contents, (key, value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
        if (typeof value === 'string' && isoDateRegex.test(value)) {
            return new Date(value); // automatic date conversion
        }
        else if (typeof value === 'string' && value.toLowerCase() in taskPriority) {
            return taskPriority[value.toLowerCase()];
        }
        return value;
    });
    return task;
}
function calculateDaysToGo(taskTime) {
    const now = new Date();
    const msToGo = taskTime - now.getTime();
    const daysToGo = Math.ceil(msToGo / (1000 * 60 * 60 * 24));
    return daysToGo;
}
function renderMatrix(topLeft, topRight, bottomLeft, bottomRight) {
    const colWidth = 36;
    const pad = (s) => s.padEnd(colWidth - 2).slice(0, colWidth - 2);
    const cell = (s) => `│ ${pad(s)} `;
    const formatTasks = (tasks) => tasks.length ? tasks.map(t => `• ${t.Name} (${calculateDaysToGo(t.Due.getTime())}d)`) : ['(none)'];
    const rows = (left, right) => {
        const l = formatTasks(left);
        const r = formatTasks(right);
        const len = Math.max(l.length, r.length);
        return Array.from({ length: len }, (_, i) => { var _a, _b; return cell((_a = l[i]) !== null && _a !== void 0 ? _a : '') + cell((_b = r[i]) !== null && _b !== void 0 ? _b : '') + '│'; });
    };
    const top = `┌${'─'.repeat(colWidth)}┬${'─'.repeat(colWidth)}┐`;
    const mid = `├${'─'.repeat(colWidth)}┼${'─'.repeat(colWidth)}┤`;
    const bottom = `└${'─'.repeat(colWidth)}┴${'─'.repeat(colWidth)}┘`;
    console.log(top);
    console.log(cell('DO') + cell('PLAN') + '│');
    rows(topLeft, topRight).forEach(r => console.log(r));
    console.log(mid);
    console.log(cell('DELEGATE') + cell('IGNORE') + '│');
    rows(bottomLeft, bottomRight).forEach(r => console.log(r));
    console.log(bottom);
}
function loadTasks(taskDir) {
    let tasks = [];
    const taskPaths = fs.readdirSync(taskDir).filter(f => fs.statSync(`./tasks/${f}`).isFile());
    for (let taskPath of taskPaths) {
        tasks.push(readTask(`./tasks/${taskPath}`));
    }
    return tasks;
}
function displayEisenhowerMatrix() {
    let tasks = loadTasks('./tasks');
    let tasksHighPriorityUrgent = [];
    let tasksHighPriorityDistant = [];
    let tasksLowPriorityUrgent = [];
    let tasksLowPriorityDistant = [];
    for (let task of tasks) {
        let daysToGo = calculateDaysToGo(task.Due.getTime());
        if (task.Priority === taskPriority.high && daysToGo < urgentThreshold) {
            tasksHighPriorityUrgent.push(task);
        }
        else if (task.Priority === taskPriority.high && daysToGo >= urgentThreshold) {
            tasksHighPriorityDistant.push(task);
        }
        else if (task.Priority === taskPriority.low && daysToGo < urgentThreshold) {
            tasksLowPriorityUrgent.push(task);
        }
        else if (task.Priority === taskPriority.low && daysToGo >= urgentThreshold) {
            tasksLowPriorityDistant.push(task);
        }
    }
    renderMatrix(tasksHighPriorityUrgent, tasksHighPriorityDistant, tasksLowPriorityUrgent, tasksLowPriorityDistant);
}
function listTaskNames() {
    let tasks = loadTasks('./tasks');
    let taskNames = [];
    for (let task of tasks) {
        taskNames.push(task.Name);
    }
    return taskNames;
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
                type: 'select',
                name: 'Priority',
                message: 'Priority level of task:',
                // only offer choices from the string values of the taskPriority
                choices: Object.keys(taskPriority).filter(k => isNaN(Number(k)))
            },
            {
                type: 'select',
                name: 'State',
                message: 'Current state of task',
                // only offer choices from the string values of the taskState
                choices: Object.keys(taskState).filter(k => isNaN(Number(k)))
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
                choices: listTaskNames()
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
displayEisenhowerMatrix();
// User chooses to add new or edit existing
mainMenu();
