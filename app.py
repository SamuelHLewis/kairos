from flask import Flask, render_template, jsonify, request
import sqlite3
import os

app = Flask(__name__)
DB_FILE = 'tasks.db'

ALLOWED_FIELDS = {'task', 'status', 'importance', 'due_date'}

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                task        TEXT    NOT NULL,
                status      TEXT    NOT NULL DEFAULT 'incomplete',
                importance  TEXT    NOT NULL DEFAULT 'low',
                due_date    TEXT
            )
        ''')
        conn.commit()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    with get_db() as conn:
        rows = conn.execute('SELECT * FROM tasks ORDER BY id').fetchall()
    tasks = [dict(row) for row in rows]
    # Normalise due_date: return empty string instead of None for the frontend
    for t in tasks:
        if t['due_date'] is None:
            t['due_date'] = ''
    return jsonify(tasks)

@app.route('/update_task', methods=['POST'])
def update_task():
    data = request.json
    task_id = data.get('id')
    field = data.get('field')
    value = data.get('value')

    if field not in ALLOWED_FIELDS:
        return jsonify({'status': 'error', 'message': 'Invalid field'}), 400

    db_value = value if value != '' else None
    with get_db() as conn:
        cursor = conn.execute(
            f'UPDATE tasks SET {field} = ? WHERE id = ?',
            (db_value, task_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'status': 'error', 'message': 'Task not found'}), 404
        rows = conn.execute('SELECT * FROM tasks ORDER BY id').fetchall()
    tasks = [dict(row) for row in rows]
    for t in tasks:
        if t['due_date'] is None:
            t['due_date'] = ''
    return jsonify({'status': 'success', 'tasks': tasks})

@app.route('/add_task', methods=['POST'])
def add_task():
    data = request.json
    task_name = data.get('task')
    if not task_name:
        return jsonify({'status': 'error', 'message': 'Task name is required'}), 400

    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO tasks (task, status, importance, due_date) VALUES (?, ?, ?, ?)',
            (task_name, 'incomplete', 'low', None)
        )
        conn.commit()
        new_id = cursor.lastrowid
        row = conn.execute('SELECT * FROM tasks WHERE id = ?', (new_id,)).fetchone()
    new_task = dict(row)
    new_task['due_date'] = new_task['due_date'] or ''
    return jsonify({'status': 'success', 'task': new_task})

@app.route('/delete_task', methods=['POST'])
def delete_task():
    data = request.json
    task_id = data.get('id')

    with get_db() as conn:
        cursor = conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'status': 'error', 'message': 'Task not found'}), 404
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
