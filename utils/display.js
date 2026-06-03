"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMatrix = renderMatrix;
exports.displayEisenhowerMatrix = displayEisenhowerMatrix;
const types_1 = require("./types");
const taskIO_1 = require("./taskIO");
const config_1 = require("./config");
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
function displayEisenhowerMatrix() {
    let tasks = (0, taskIO_1.loadTasks)('./tasks');
    let tasksHighPriorityUrgent = [];
    let tasksHighPriorityDistant = [];
    let tasksLowPriorityUrgent = [];
    let tasksLowPriorityDistant = [];
    for (let task of tasks) {
        let daysToGo = calculateDaysToGo(task.Due.getTime());
        if (task.Priority === types_1.taskPriority.high && daysToGo < config_1.config.urgentThreshold) {
            tasksHighPriorityUrgent.push(task);
        }
        else if (task.Priority === types_1.taskPriority.high && daysToGo >= config_1.config.urgentThreshold) {
            tasksHighPriorityDistant.push(task);
        }
        else if (task.Priority === types_1.taskPriority.low && daysToGo < config_1.config.urgentThreshold) {
            tasksLowPriorityUrgent.push(task);
        }
        else if (task.Priority === types_1.taskPriority.low && daysToGo >= config_1.config.urgentThreshold) {
            tasksLowPriorityDistant.push(task);
        }
    }
    renderMatrix(tasksHighPriorityUrgent, tasksHighPriorityDistant, tasksLowPriorityUrgent, tasksLowPriorityDistant);
}
