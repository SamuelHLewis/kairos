import * as fs from 'fs';
import { taskState, taskPriority, taskEntry } from './types';

export function readTask(taskFilePath: string) {
    const task_file_contents = fs.readFileSync(taskFilePath, 'utf8');

    // use a reviver function to automatically convert dates to Date type while parsing
    // also convert Priority level strings to enum types, handling case differences
    const task: taskEntry = JSON.parse(task_file_contents, (key, value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
        if (typeof value === 'string' && isoDateRegex.test(value)) {
            return new Date(value) // automatic date conversion
        } else if (typeof value === 'string' && value.toLowerCase() in taskPriority) {
            return taskPriority[value.toLowerCase() as keyof typeof taskPriority];
        }
        return value;
    })

    return task
}

export function loadTasks(taskDir: string) {
    let tasks = []
    const taskPaths = fs.readdirSync(taskDir).filter(f =>
        fs.statSync(`./tasks/${f}`).isFile()
    )
    for (let taskPath of taskPaths){
        tasks.push(readTask(`./tasks/${taskPath}`))
    }
    return tasks
}

export function listTaskNames() {
    let tasks = loadTasks('./tasks')
    let taskNames = []
    for (let task of tasks) {
        taskNames.push(task.Name)
    }
    return taskNames
}