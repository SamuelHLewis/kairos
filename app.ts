import * as fs from 'fs';
import inquirer from 'inquirer';
import { listTaskNames } from './utils/taskIO';
import { taskState, taskPriority, taskEntry } from './utils/types';
import { displayEisenhowerMatrix } from './utils/display';

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
