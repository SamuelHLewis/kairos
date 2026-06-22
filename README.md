# KAIROS

KAIROS: Keep All Important Requirements On Schedule

A simple task management app.

## Tech Stack

- **Backend:** Python 3, Flask
- **Database:** SQLite
- **Frontend:** HTML, CSS, Vanilla JavaScript

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/SamuelHLewis/kairos
   cd kairos
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. **Upgrade pip and install dependencies:**
   ```bash
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   ```

## Usage Instructions

1. **Start the application server:**
   ```bash
   python app.py
   ```
2. **Access the application:**
   Open your web browser and navigate to [http://localhost:5000](http://localhost:5000) or [http://127.0.0.1:5000](http://127.0.0.1:5000).
3. **Manage Tasks:**
   Use the web interface to add, edit (status, importance, due dates), and delete tasks.