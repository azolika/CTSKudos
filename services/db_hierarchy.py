# ---------------------------------------------------------------
# db_hierarchy.py
# Centralized hierarchy-related database operations
# Extracted from admin.py and db.py
# Comments are in English (as requested)
# ---------------------------------------------------------------

import sqlite3


# ---------------------------------------------------------------
# Helper: DB connection
# ---------------------------------------------------------------
def _get_conn():
    """Open a new SQLite connection to feedback.db."""
    return sqlite3.connect("data/feedback.db")


# ---------------------------------------------------------------
# HIERARCHY OPERATIONS
# ---------------------------------------------------------------

def set_manager_for_user(user_id: int, manager_id: int | None):
    """
    Set or clear a manager for a given user.
    Mirrors original admin.py behaviour:
    - Always remove existing manager mapping
    - Add new one only if manager_id is not None
    """
    conn = _get_conn()
    c = conn.cursor()

    # Remove any previous manager assignment
    c.execute("DELETE FROM hierarchy WHERE user_id = ?", (user_id,))

    # Insert new manager assignment if provided
    if manager_id is not None:
        c.execute("""
            INSERT INTO hierarchy(user_id, manager_id)
            VALUES (?, ?)
        """, (user_id, manager_id))

    conn.commit()
    conn.close()


def assign_manager(user_id: int, manager_id: int):
    """
    Assign a manager to a user WITHOUT deleting previous ones.
    (Used only where multiple records may be allowed, but not used in UI.)
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO hierarchy(user_id, manager_id)
        VALUES (?, ?)
    """, (user_id, manager_id))
    conn.commit()
    conn.close()


def get_manager_for_user(user_id: int):
    """
    Return the manager (id, name) for a given user.
    Returns: (manager_id, manager_name) or None.
    """
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


def get_subordinates(manager_id: int):
    """
    Return a list of all subordinates of a manager.
    Unified version used for both manager.py and admin.py.
    Returns rows of: (user_id, name, departament, functia)
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
