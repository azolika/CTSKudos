import sqlite3
from datetime import datetime
import os
from services.emailer import send_email
from services.db_users import get_user_by_id
# ---------------------------------------------------------------
# Helper: DB connection
# ---------------------------------------------------------------
def _get_conn():
    """Open a new SQLite connection to feedback.db."""
    return sqlite3.connect("data/feedback.db")


# ---------------------------------------------------------------
# ADD FEEDBACK
# ---------------------------------------------------------------

def add_feedback(manager_id: int, employee_id: int, point_type: str, comment: str):
    """
    Insert a new feedback entry.
    Sends notification email to employee.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO feedback(manager_id, employee_id, point_type, comment, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (manager_id, employee_id, point_type, comment, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    # ---------------------------------------------------------------
    # SEND EMAIL NOTIFICATION TO EMPLOYEE
    # ---------------------------------------------------------------
    employee = get_user_by_id(employee_id)
    manager = get_user_by_id(manager_id)
    if employee_id in employee:

        to_email = employee[1]  # username = email
        print(employee[2])
        employee_name = employee[2]
        manager_name = manager[2]

        app_url = os.getenv("APP_BASE_URL", "http://localhost:9000")

        html_body = f"""
            <h2>Ați primit un feedback nou în aplicația <strong>Kudos CargoTrack</strong></h2>

            <p>Bună, <strong>{employee_name}</strong>,</p>

            <p>Ai primit un feedback nou de la managerul tău,
            <strong>{manager_name}</strong>, în cadrul aplicației <strong>Kudos CargoTrack</strong>.</p>

            <p>Tip feedback: <strong>{'Roșu' if point_type == 'rosu' else 'Negru'}</strong><br>
            Comentariu: {comment}</p>

            <p>Puteți accesa aplicația aici:<br>
            <a href="{app_url}">{app_url}</a></p>

            <br>
            <p>Cu stimă,<br>
            Echipa <strong>Kudos CargoTrack</strong></p>
        """
        print(to_email, html_body)
        send_email(
            to_email=to_email,
            subject="Ați primit un nou feedback",
            html_body=html_body
        )



# ---------------------------------------------------------------
# FEEDBACK QUERIES
# ---------------------------------------------------------------

def get_feedback_for_employee(employee_id: int):
    """
    Returns feedback for an employee without joining user names.
    This keeps compatibility with older db.py usage.
    Returns rows: (point_type, comment, timestamp)
    """
    conn = _get_conn()
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


def get_feedback_for_user(user_id: int):
    """
    Returns feedback with manager names (used in manager.py and user_page.py).
    Returns rows: (point_type, comment, timestamp, manager_name)
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT f.point_type, f.comment, f.timestamp, m.name
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        WHERE f.employee_id = ?
        ORDER BY f.timestamp DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return rows


# ---------------------------------------------------------------
# TEAM FEEDBACK SUMMARY (USED IN MANAGER DASHBOARD)
# ---------------------------------------------------------------

def get_feedback_points_for_subordinates(sub_ids: list[int]):
    """
    Return all feedback points for a list of subordinate user IDs.
    Used to calculate team-wide statistics in manager dashboard.
    Returns rows: (point_type, employee_id)
    """
    if not sub_ids:
        return []

    conn = _get_conn()
    c = conn.cursor()

    placeholders = ",".join(["?"] * len(sub_ids))
    c.execute(
        f"SELECT point_type, employee_id FROM feedback WHERE employee_id IN ({placeholders})",
        sub_ids
    )
    rows = c.fetchall()
    conn.close()
    return rows

def get_user_points(user_id: int):
    """
    Return (red_count, black_count).
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT point_type
        FROM feedback
        WHERE employee_id = ?
    """, (user_id,))
    rows = c.fetchall()
    conn.close()

    red = sum(1 for (pt,) in rows if pt == "rosu")
    black = sum(1 for (pt,) in rows if pt == "negru")
    return red, black


def get_user_calificativ(user_id: int):
    """
    Return calificativ ('Nesatisfăcător', 'Satisfăcător', 'Bun', 'Excelent')
    based on % roșu like everywhere else in system.
    """
    red, black = get_user_points(user_id)
    total = red + black

    if total == 0:
        return "N/A"

    pct_red = (red / total) * 100

    if pct_red < 25:
        return "Nesatisfăcător"
    elif pct_red < 50:
        return "Satisfăcător"
    elif pct_red < 75:
        return "Bun"
    else:
        return "Excelent"

def get_last_feedback(limit=50):
    """
    Return latest feedback entries with manager and employee names.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT 
            f.timestamp,
            m.name AS manager_name,
            e.name AS employee_name,
            f.point_type,
            f.comment
        FROM feedback f
        LEFT JOIN users m ON f.manager_id = m.id
        LEFT JOIN users e ON f.employee_id = e.id
        ORDER BY f.timestamp DESC
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return rows
