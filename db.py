# ---------------------------------------------------------------
# db.py
# Database initialization module
# After refactor, this file ONLY contains init_db() and no logic
# All user/hierarchy/feedback operations were moved to:
#   - db_users.py
#   - db_hierarchy.py
#   - db_feedback.py
# Comments are in English (as requested)
# ---------------------------------------------------------------

import sqlite3
import bcrypt
import os


def init_db():
    """Create all required tables if they don't exist."""

    # Ensure data directory exists (important for Docker volume)
    os.makedirs("data", exist_ok=True)

    # Main DB path (Docker volume mounts /app/data)
    db_path = "data/feedback.db"

    conn = sqlite3.connect(db_path)
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

    # FEEDBACK table
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

    # PASSWORD RESET TOKENS
    c.execute("""
    CREATE TABLE IF NOT EXISTS password_reset (
        email TEXT,
        token TEXT,
        timestamp TEXT
    )
    """)

    # Create default admin user if missing
    c.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    if c.fetchone()[0] == 0:
        pw_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        c.execute("""
            INSERT INTO users(username, name, role, password_hash)
            VALUES (?, ?, ?, ?)
        """, ("admin", "Administrator", "admin", pw_hash))
        conn.commit()

    conn.close()
