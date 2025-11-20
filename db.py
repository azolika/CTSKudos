import sqlite3
import bcrypt

def init_db():
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()

    # USERS table
    c.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        role TEXT,
        password_hash TEXT,
        departament TEXT,
        functia TEXT
    )
    """)

    # HIERARCHY table
    c.execute("""
    CREATE TABLE IF NOT EXISTS hierarchy(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        manager_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(manager_id) REFERENCES users(id)
    )
    """)

    # FEEDBACK table  <<<<<< THIS WAS MISSING
    c.execute("""
    CREATE TABLE IF NOT EXISTS feedback(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manager_id INTEGER,
        employee_id INTEGER,
        point_type TEXT,
        comment TEXT,
        timestamp TEXT,
        FOREIGN KEY(manager_id) REFERENCES users(id),
        FOREIGN KEY(employee_id) REFERENCES users(id)
    )
    """)

    conn.commit()

    # Default admin
    c.execute("SELECT COUNT(*) FROM users WHERE username='admin'")
    if c.fetchone()[0] == 0:
        import bcrypt
        pw = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        c.execute("""
            INSERT INTO users(username, name, role, password_hash)
            VALUES (?, ?, ?, ?)
        """, ("admin", "Administrator", "admin", pw))
        conn.commit()

    conn.close()

# ---------------------------------------------------------
# Employees logic
# ---------------------------------------------------------
def get_employees_by_manager(manager_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT id, name FROM employees WHERE manager_id = ?", (manager_id,))
    rows = c.fetchall()
    conn.close()
    return rows


# ---------------------------------------------------------
# Feedback logic
# ---------------------------------------------------------
def add_feedback(manager_id, employee_id, point_type, comment, timestamp):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute(
        "INSERT INTO feedback(manager_id, employee_id, point_type, comment, timestamp) VALUES (?, ?, ?, ?, ?)",
        (manager_id, employee_id, point_type, comment, timestamp)
    )
    conn.commit()
    conn.close()


def get_feedback_for_employee(employee_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        SELECT point_type, comment, timestamp
        FROM feedback
        WHERE employee_id = ?
        ORDER BY timestamp DESC
    """, (employee_id,))
    rows = c.fetchall()
    conn.close()
    return rows

def update_user_password(username, new_password):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()

    pw_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

    c.execute(
        "UPDATE users SET password_hash = ? WHERE name = ?",
        (pw_hash, username)
    )
    conn.commit()
    conn.close()

def add_user(username, name, password_hash, departament, functia, role):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO users(username, name, role, password_hash, departament, functia)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, name, role, password_hash, departament, functia))
    conn.commit()
    conn.close()



def assign_manager(user_id, manager_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO hierarchy(user_id, manager_id)
        VALUES (?, ?)
    """, (user_id, manager_id))
    conn.commit()
    conn.close()


def get_subordinates(manager_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        SELECT u.id, u.name, u.departament, u.functia
        FROM hierarchy h
        JOIN users u ON h.user_id = u.id
        WHERE h.manager_id = ?
    """, (manager_id,))
    rows = c.fetchall()
    conn.close()
    return rows
