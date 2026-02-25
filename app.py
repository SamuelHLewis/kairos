from flask import Flask, render_template, jsonify, request
import pandas as pd
import os

app = Flask(__name__)
TASKS_FILE = 'tasks.csv'

def read_tasks():
    if not os.path.exists(TASKS_FILE):
        return []
    df = pd.read_csv(TASKS_FILE)
    df = df.fillna('')
    return df.to_dict(orient='records')

def write_tasks(tasks):
    df = pd.DataFrame(tasks)
    df.to_csv(TASKS_FILE, index=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = read_tasks()
    return jsonify(tasks)

@app.route('/update_task', methods=['POST'])
def update_task():
    data = request.json
    task_id = data.get('id')
    field = data.get('field')
    value = data.get('value')

    tasks = read_tasks()
    updated = False
    for task in tasks:
        if str(task['id']) == str(task_id):
            task[field] = value
            updated = True
            break
    
    if updated:
        write_tasks(tasks)
        return jsonify({'status': 'success', 'tasks': tasks})
    return jsonify({'status': 'error', 'message': 'Task not found'}), 404

@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.json
    task_name = data.get('task')
    if not task_name:
        return jsonify({'status': 'error', 'message': 'Task name is required'}), 400

    tasks = read_tasks()
    new_id = 1 if not tasks else max(int(t['id']) for t in tasks) + 1
    new_task = {
        'id': new_id,
        'task': task_name,
        'status': 'incomplete',
        'importance': 'low', # Default
        'due_date': ''       # Default
    }
    tasks.append(new_task)
    write_tasks(tasks)
    return jsonify({'status': 'success', 'task': new_task})

@app.route('/delete_task', methods=['POST'])
def delete_task():
    data = request.json
    task_id = data.get('id')
    
    tasks = read_tasks()
    initial_count = len(tasks)
    tasks = [t for t in tasks if str(t['id']) != str(task_id)]
    
    if len(tasks) < initial_count:
        write_tasks(tasks)
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
