document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
});

function fetchTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            renderTaskList(tasks);
            renderMatrix(tasks);
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function renderTaskList(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
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
                    <label>Urgency:</label>
                    <select onchange="updateTask('${task.id}', 'urgency', this.value)">
                        <option value="high" ${task.urgency === 'high' ? 'selected' : ''}>High</option>
                        <option value="low" ${task.urgency === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
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

    tasks.forEach(task => {
        if (task.status === 'complete') return; // Don't show completed tasks in matrix

        const li = document.createElement('li');
        li.textContent = task.task;

        if (task.importance === 'high' && task.urgency === 'high') {
            q1List.appendChild(li);
        } else if (task.importance === 'high' && task.urgency === 'low') {
            q2List.appendChild(li);
        } else if (task.importance === 'low' && task.urgency === 'high') {
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
