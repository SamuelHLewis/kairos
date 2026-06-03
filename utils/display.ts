import { taskState, taskPriority, taskEntry } from './types';
import { loadTasks } from './taskIO';

// set the threshold for urgency in days here
const urgentThreshold = 3;

function calculateDaysToGo(taskTime: number) {
    const now = new Date()
    const msToGo: number = taskTime - now.getTime();
    const daysToGo: number = Math.ceil(msToGo / (1000 * 60 * 60 * 24))
    return daysToGo
}

export function renderMatrix(
    topLeft: taskEntry[], topRight: taskEntry[],
    bottomLeft: taskEntry[], bottomRight: taskEntry[]
) {
    const colWidth = 36;
    const pad = (s: string) => s.padEnd(colWidth - 2).slice(0, colWidth - 2);
    const cell = (s: string) => `│ ${pad(s)} `;

    const formatTasks = (tasks: taskEntry[]) =>
        tasks.length ? tasks.map(t => `• ${t.Name} (${calculateDaysToGo(t.Due.getTime())}d)`) : ['(none)'];

    const rows = (left: taskEntry[], right: taskEntry[]) => {
        const l = formatTasks(left);
        const r = formatTasks(right);
        const len = Math.max(l.length, r.length);
        return Array.from({ length: len }, (_, i) =>
            cell(l[i] ?? '') + cell(r[i] ?? '') + '│'
        );
    };

    const top =    `┌${'─'.repeat(colWidth)}┬${'─'.repeat(colWidth)}┐`;
    const mid =    `├${'─'.repeat(colWidth)}┼${'─'.repeat(colWidth)}┤`;
    const bottom = `└${'─'.repeat(colWidth)}┴${'─'.repeat(colWidth)}┘`;

    console.log(top);
    console.log(cell('DO') + cell('PLAN') + '│');
    rows(topLeft, topRight).forEach(r => console.log(r));
    console.log(mid);
    console.log(cell('DELEGATE') + cell('IGNORE') + '│');
    rows(bottomLeft, bottomRight).forEach(r => console.log(r));
    console.log(bottom);
}

export function displayEisenhowerMatrix() {
    let tasks = loadTasks('./tasks')
    let tasksHighPriorityUrgent = []
    let tasksHighPriorityDistant = []
    let tasksLowPriorityUrgent = []
    let tasksLowPriorityDistant = []
    for (let task of tasks) {
        let daysToGo: number = calculateDaysToGo(task.Due.getTime())
        if(task.Priority === taskPriority.high && daysToGo < urgentThreshold) {
            tasksHighPriorityUrgent.push(task)
        } else if(task.Priority === taskPriority.high && daysToGo >= urgentThreshold){
            tasksHighPriorityDistant.push(task)
        } else if(task.Priority === taskPriority.low && daysToGo < urgentThreshold) {
            tasksLowPriorityUrgent.push(task)
        } else if(task.Priority === taskPriority.low && daysToGo >= urgentThreshold){
            tasksLowPriorityDistant.push(task)
        }
    }
    renderMatrix(
        tasksHighPriorityUrgent, tasksHighPriorityDistant,
        tasksLowPriorityUrgent, tasksLowPriorityDistant
    )
}