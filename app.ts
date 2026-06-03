import * as fs from 'fs';
import inquirer from 'inquirer';

// set the threshold for urgency in days here
const urgentThreshold = 3;

enum taskState {
    notStarted,
    inProgress,
    done
}

enum taskPriority {
    low,
    high
}

interface taskEntry {
    Name: string,
    Description: string,
    Due: Date,
    Priority: taskPriority,
    State: taskState
}

function readTask(taskFilePath: string) {
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

function calculateDaysToGo(taskTime: number) {
    const now = new Date()
    const msToGo: number = taskTime - now.getTime();
    const daysToGo: number = Math.ceil(msToGo / (1000 * 60 * 60 * 24))
    return daysToGo
}

function renderMatrix(
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

function loadTasks(taskDir: string) {
    let tasks = []
    const taskPaths = fs.readdirSync(taskDir).filter(f =>
        fs.statSync(`./tasks/${f}`).isFile()
    )
    for (let taskPath of taskPaths){
        tasks.push(readTask(`./tasks/${taskPath}`))
    }
    return tasks
}

function displayEisenhowerMatrix() {
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

function listTaskNames() {
    let tasks = loadTasks('./tasks')
    let taskNames = []
    for (let task of tasks) {
        taskNames.push(task.Name)
    }
    return taskNames
}

async function createNewTask() {
    const newTask = await inquirer.prompt<taskEntry>([
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
    return newTask
}

async function deleteTask() {
    const { task } = await inquirer.prompt([
        {
            type: 'select',
            name: 'task',
            message: 'Which task would you like to delete?',
            choices: listTaskNames()
        }
    ]);
    const filename = `./tasks/${task.replace(/ /g, '-')}.json`;
    fs.unlinkSync(filename);
    console.log(`Task "${task}" deleted.`)
}

async function mainMenu() {
    const { action } = await inquirer.prompt([
        {
            type: 'select',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['Create a new task', 'Delete an existing task']
        }
    ]);

    if (action === 'Create a new task') {
        const userTask = await createNewTask();
        const filename = `./tasks/${userTask.Name.replace(/ /g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(userTask, null, 2));
        console.log("New task created");
        console.log(userTask);
    } else if (action === 'Delete an existing task') {
        deleteTask()
    }
}

// on launch, the current set of tasks are displayed
displayEisenhowerMatrix();
// User chooses to add new or edit existing
mainMenu();
