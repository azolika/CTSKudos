# ---------------------------------------------------------------
# db_users.py
# Centralized user-related database operations
# All logic extracted from admin.py and db.py
# Comments must remain in English (as requested)
# ---------------------------------------------------------------

import sqlite3
import uuid
from datetime import datetime

# ---------------------------------------------------------------
# Helper: open DB connection
# ---------------------------------------------------------------
def _get_conn():
    """Open a new SQLite connection to feedback.db."""
    return sqlite3.connect("data/feedback.db")


# ---------------------------------------------------------------
# USER QUERIES
# ---------------------------------------------------------------

def get_all_users():
    """
    Return all users including their manager name (Superior).
    Used in admin grid to display full user details.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT 
            u.id,
            u.username,
            u.name,
            u.role,
            u.departament,
            u.functia,
            m.name AS superior
        FROM users u
        LEFT JOIN hierarchy h ON u.id = h.user_id
        LEFT JOIN users m ON h.manager_id = m.id
        ORDER BY u.name ASC
    """)
    rows = c.fetchall()
    conn.close()
    return rows



def get_user_by_id(user_id: int):
    """Get a single user by ID."""
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT id, username, name, role, departament, functia
        FROM users
        WHERE id = ?
    """, (user_id,))
    row = c.fetchone()
    conn.close()
    return row


def get_user_id_by_username(username: str):
    """Return the user ID for a given username."""
    username = username.strip().lower()
    conn = _get_conn()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None


# ---------------------------------------------------------------
# USER CREATION / UPDATE / DELETE
# ---------------------------------------------------------------

def add_user(username: str, name: str, password_hash: str, departament: str, functia: str, role: str):
    """
    Insert a new user into the users table.
    Normalized (lowercased username, stripped fields).
    """
    username = username.lower().strip()
    departament = (departament or "").strip()
    functia = (functia or "").strip()

    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO users(username, name, role, password_hash, departament, functia)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, name, role, password_hash, departament, functia))
    conn.commit()
    conn.close()


def update_user(user_id: int, name: str, role: str, departament: str, functia: str):
    """Update basic user details."""
    departament = (departament or "").strip()
    functia = (functia or "").strip()

    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        UPDATE users
        SET name = ?, role = ?, departament = ?, functia = ?
        WHERE id = ?
    """, (name, role, departament, functia, user_id))
    conn.commit()
    conn.close()


def delete_user(user_id: int):
    """
    Delete a user and all related hierarchy records.
    IMPORTANT: This mirrors admin.py behavior.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("DELETE FROM hierarchy WHERE user_id = ? OR manager_id = ?", (user_id, user_id))
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------
# PASSWORD MANAGEMENT
# ---------------------------------------------------------------

def update_user_password(username: str, new_password_hash: str):
    """
    Update user password based on username.
    FIX: previously code used WHERE name=? which was incorrect.
    """
    username = username.lower().strip()
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        UPDATE users
        SET password_hash = ?
        WHERE username = ?
    """, (new_password_hash, username))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------
# MANAGER RELATIONSHIPS
# ---------------------------------------------------------------

def get_manager_for_user(user_id: int):
    """Return the manager (id, name) for a given user."""
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT m.id, m.name
        FROM hierarchy h
        JOIN users m ON h.manager_id = m.id
        WHERE h.user_id = ?
    """, (user_id,))
    row = c.fetchone()
    conn.close()
    return row


def set_manager_for_user(user_id: int, manager_id: int | None):
    """
    Set or clear the manager for the given user.
    Mirrors admin.py logic (delete old manager, set new one).
    """
    conn = _get_conn()
    c = conn.cursor()

    # remove old manager
    c.execute("DELETE FROM hierarchy WHERE user_id = ?", (user_id,))

    # set new manager if provided
    if manager_id is not None:
        c.execute("""
            INSERT INTO hierarchy(user_id, manager_id)
            VALUES (?, ?)
        """, (user_id, manager_id))

    conn.commit()
    conn.close()


def get_subordinates(manager_id: int):
    """
    Return all subordinate users for a given manager.
    Unified version used by both admin and manager modules.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT u.id, u.name, u.departament, u.functia
        FROM hierarchy h
        JOIN users u ON h.user_id = u.id
        WHERE h.manager_id = ?
        ORDER BY u.name
    """, (manager_id,))
    rows = c.fetchall()
    conn.close()
    return rows



def create_password_reset_token(email: str):
    """Generate a reset token for a given email."""
    token = str(uuid.uuid4())
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO password_reset(email, token, timestamp)
        VALUES (?, ?, ?)
    """, (email, token, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return token


def get_email_by_reset_token(token: str):
    """Return email if token is valid, else None."""
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT email FROM password_reset
        WHERE token = ?
        ORDER BY timestamp DESC
        LIMIT 1
    """, (token,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None
