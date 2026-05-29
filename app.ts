import * as fs from 'fs';
import inquirer from 'inquirer';

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
    const task: taskEntry = JSON.parse(task_file_contents, (key, value) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{3}$/;
        if (typeof value === 'string' && isoDateRegex.test(value)) {
            return new Date(value) // automatic date conversion
        }
        return value;
    })

    return task
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
    return newTask
}

async function mainMenu() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['Create a new task', 'Edit an existing task']
        }
    ]);

    if (action === 'Create a new task') {
        const userTask = await createNewTask();
        console.log("New task created");
        console.log(userTask);
    } else if (action === 'Edit an existing task') {
        "Yet to be implemented"
    }
}

mainMenu();
