# ---------------------------------------------------------------
# db_users.py
# Centralized user-related database operations
# All logic extracted from admin.py and db.py
# Comments must remain in English (as requested)
# ---------------------------------------------------------------

from db import get_db_connection
import uuid
from datetime import datetime

# ---------------------------------------------------------------
# Helper: open DB connection
# ---------------------------------------------------------------
def _get_conn():
    """Open a new MariaDB connection."""
    return get_db_connection()


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
        WHERE id = %s
    """, (user_id,))
    row = c.fetchone()
    conn.close()
    return row


def get_user_id_by_username(username: str):
    """Return the user ID for a given username."""
    username = username.strip().lower()
    conn = _get_conn()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = %s", (username,))
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
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (username, name, role, password_hash, departament, functia))
    user_id = c.lastrowid
    conn.commit()
    conn.close()
    return user_id


def update_user(user_id: int, name: str, role: str, departament: str, functia: str):
    """Update basic user details."""
    departament = (departament or "").strip()
    functia = (functia or "").strip()

    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        UPDATE users
        SET name = %s, role = %s, departament = %s, functia = %s
        WHERE id = %s
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
    c.execute("DELETE FROM hierarchy WHERE user_id = %s OR manager_id = %s", (user_id, user_id))
    c.execute("DELETE FROM feedback WHERE employee_id = %s OR manager_id = %s", (user_id, user_id))
    c.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------
# PASSWORD MANAGEMENT
# ---------------------------------------------------------------

def update_user_password(username: str, new_password_hash: str):
    """
    Update user password based on username.
    FIX: previously code used WHERE name=%s which was incorrect.
    """
    username = username.lower().strip()
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        UPDATE users
        SET password_hash = %s
        WHERE username = %s
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
        WHERE h.user_id = %s
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
    c.execute("DELETE FROM hierarchy WHERE user_id = %s", (user_id,))

    # set new manager if provided
    if manager_id is not None:
        c.execute("""
            INSERT INTO hierarchy(user_id, manager_id)
            VALUES (%s, %s)
        """, (user_id, manager_id))

    conn.commit()
    conn.close()


def get_subordinates(manager_id: int):
    """
    Return all descendant users in the hierarchy tree for a given manager.
    Uses a RECURSIVE CTE to fetch all levels of the hierarchy.
    """
    conn = _get_conn()
    c = conn.cursor()
    
    # RECURSIVE CTE to find all descendants
    query = """
        WITH RECURSIVE subordinates_cte AS (
            -- Anchor member: direct reports
            SELECT user_id FROM hierarchy WHERE manager_id = %s
            UNION ALL
            -- Recursive member: reports of the reports
            SELECT h.user_id FROM hierarchy h
            JOIN subordinates_cte s ON h.manager_id = s.user_id
        )
        SELECT DISTINCT u.id, u.name, u.departament, u.functia
        FROM subordinates_cte s
        JOIN users u ON s.user_id = u.id
        ORDER BY u.name
    """
    
    c.execute(query, (manager_id,))
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
        VALUES (%s, %s, %s)
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
        WHERE token = %s
        ORDER BY timestamp DESC
        LIMIT 1
    """, (token,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None


# ---------------------------------------------------------------
# DATA EXPORT
# ---------------------------------------------------------------

def get_all_users_export():
    """
    Return all users for API export (PowerBI).
    Includes id, excludes password_hash.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT u.id, u.username, u.name, u.role, u.departament, u.functia, h.manager_id
        FROM users u
        LEFT JOIN hierarchy h ON u.id = h.user_id
        ORDER BY u.id ASC
    """)
    rows = c.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "username": r[1],
            "name": r[2],
            "role": r[3],
            "departament": r[4],
            "functia": r[5],
            "manager_id": r[6]
        })
    return result
