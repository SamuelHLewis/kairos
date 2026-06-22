let currentTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchTasks();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

function fetchTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            currentTasks = tasks;
            renderTaskList(tasks);
            renderMatrix(tasks);
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function renderTaskList(tasks) {
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    taskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const activeTasks = tasks.filter(task => task.status !== 'complete');
    const completedTasks = tasks.filter(task => task.status === 'complete');

    // Sort completed tasks in reverse chronological order
    completedTasks.sort((a, b) => {
        const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return b.id - a.id;
    });

    activeTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });

    completedTasks.forEach(task => {
        const li = createTaskElement(task);
        completedTaskList.appendChild(li);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.status === 'complete' ? 'completed' : ''}`;
    
    li.innerHTML = `
        <div class="task-header">
            <input type="checkbox" ${task.status === 'complete' ? 'checked' : ''} 
                   onchange="updateTask('${task.id}', 'status', this.checked ? 'complete' : 'incomplete')">
            <span class="task-name" contenteditable="true" 
                  onblur="updateTask('${task.id}', 'task', this.textContent)"
                  onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }">${task.task}</span>
        </div>
        <div class="task-controls">
            <div class="task-control-group">
                <label>Importance:</label>
                <select onchange="updateTask('${task.id}', 'importance', this.value)">
                    <option value="high" ${task.importance === 'high' ? 'selected' : ''}>High</option>
                    <option value="low" ${task.importance === 'low' ? 'selected' : ''}>Low</option>
                </select>
            </div>
            <div class="task-control-group">
                <label>Due Date:</label>
                <input type="date" value="${task.due_date || ''}" onchange="updateTask('${task.id}', 'due_date', this.value)">
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
    `;
    return li;
}

function toggleCompletedTasks() {
    const section = document.querySelector('.completed-tasks-section');
    const icon = document.getElementById('completed-toggle-icon');
    section.classList.toggle('expanded');
    if (section.classList.contains('expanded')) {
        icon.textContent = '▲';
    } else {
        icon.textContent = '▼';
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}

function addTask() {
    const input = document.getElementById('new-task-input');
    const taskName = input.value.trim();

    if (!taskName) return;

    fetch('/add_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            input.value = ''; // Clear input
            fetchTasks(); // Refresh list
        } else {
            console.error('Error adding task:', data.message);
        }
    })
    .catch(error => console.error('Error adding task:', error));
}

function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    fetch('/delete_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fetchTasks(); // Refresh list
        } else {
            console.error('Error deleting task:', data.message);
        }
    })
    .catch(error => console.error('Error deleting task:', error));
}

function renderMatrix(tasks) {
    const q1List = document.getElementById('q1-list');
    const q2List = document.getElementById('q2-list');
    const q3List = document.getElementById('q3-list');
    const q4List = document.getElementById('q4-list');

    // Clear existing lists
    q1List.innerHTML = '';
    q2List.innerHTML = '';
    q3List.innerHTML = '';
    q4List.innerHTML = '';

    const thresholdSlider = document.getElementById('urgency-threshold');
    const thresholdDays = thresholdSlider ? parseInt(thresholdSlider.value, 10) : 3;

    tasks.forEach(task => {
        if (task.status === 'complete') return; // Don't show completed tasks in matrix

        let isUrgent = false;
        let diffDays = null;
        if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const today = new Date();
            // Reset time parts for accurate day comparison
            dueDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            
            const diffTime = dueDate - today;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            isUrgent = diffDays <= thresholdDays;
        }

        const isImportant = task.importance === 'high';

        const li = document.createElement('li');

        let badgeHtml = '';
        if (diffDays !== null) {
            let badgeClass, badgeText;
            if (diffDays > 0) {
                badgeClass = 'days-green';
                badgeText = `${diffDays}d`;
            } else if (diffDays === 0) {
                badgeClass = 'days-orange';
                badgeText = 'Today';
            } else {
                badgeClass = 'days-red';
                badgeText = `${Math.abs(diffDays)}d late`;
            }
            badgeHtml = `<span class="days-badge ${badgeClass}">${badgeText}</span>`;
        }

        li.innerHTML = `<span class="matrix-task-name">${task.task}</span>${badgeHtml}`;

        if (isImportant && isUrgent) {
            q1List.appendChild(li);
        } else if (isImportant && !isUrgent) {
            q2List.appendChild(li);
        } else if (!isImportant && isUrgent) {
            q3List.appendChild(li);
        } else {
            q4List.appendChild(li);
        }
    });
}

function updateTask(id, field, value) {
    fetch('/update_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, field, value }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Re-fetch to ensure UI is in sync with server state
            // For a smoother experience we could update local state, 
            // but fetching is safer for data consistency.
            fetchTasks(); 
        } else {
            console.error('Error updating task:', data.message);
        }
    })
    .catch(error => console.error('Error updating task:', error));
}
