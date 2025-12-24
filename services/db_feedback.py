from db import get_db_connection
from datetime import datetime
import os
from services.emailer import send_email
from services.db_users import get_user_by_id
# ---------------------------------------------------------------
# Helper: DB connection
# ---------------------------------------------------------------
def _get_conn():
    """Open a new MariaDB connection."""
    return get_db_connection()


# ---------------------------------------------------------------
# ADD FEEDBACK
# ---------------------------------------------------------------

# ---------------------------------------------------------------
# ADD FEEDBACK
# ---------------------------------------------------------------

def add_feedback(manager_id: int, employee_id: int, point_type: str, comment: str, category: str = "General"):
    """
    Insert a new feedback entry.
    Sends notification email to employee.
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        INSERT INTO feedback(manager_id, employee_id, point_type, comment, timestamp, category)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (manager_id, employee_id, point_type, comment, datetime.now().isoformat(), category))
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

        app_url = os.getenv("APP_BASE_URL", "http://localhost:5173")

        html_body = f"""
            <h2>Ați primit un feedback nou în aplicația <strong>Kudos by CargoTrack</strong></h2>

            <p>Bună, <strong>{employee_name}</strong>,</p>

            <p>Ai primit un feedback nou de la managerul tău,
            <strong>{manager_name}</strong>, în cadrul aplicației <strong>Kudos by CargoTrack</strong>.</p>

            # <p>Tip feedback: <strong>{'Punct roșu' if point_type == 'rosu' else 'Punct negru'}</strong><br>
            # Categorie: <strong>{category}</strong><br>
            # Comentariu: {comment}</p>

            # <p>Puteți accesa aplicația aici:<br>
            # <a href="{app_url}">{app_url}</a></p>

            <br>
            <p>Cu stimă,<br>
            Echipa <strong>Kudos by CargoTrack</strong></p>
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
    Returns rows: (point_type, comment, timestamp, category)
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT point_type, comment, timestamp, category
        FROM feedback
        WHERE employee_id = %s
        ORDER BY timestamp DESC
    """, (employee_id,))
    rows = c.fetchall()
    conn.close()
    return rows


def get_feedback_for_user(user_id: int):
    """
    Returns feedback with manager names (used in manager.py and user_page.py).
    Returns rows: (point_type, comment, timestamp, manager_name, category)
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT f.point_type, f.comment, f.timestamp, m.name, f.category
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        WHERE f.employee_id = %s
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

    placeholders = ",".join(["%s"] * len(sub_ids))
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
        WHERE employee_id = %s
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
            f.comment,
            f.category
        FROM feedback f
        LEFT JOIN users m ON f.manager_id = m.id
        LEFT JOIN users e ON f.employee_id = e.id
        ORDER BY f.timestamp DESC
        LIMIT %s
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return rows


def get_user_stats_by_category(user_id: int):
    """
    Returns a list of dicts:
    [
      {"category": "Communication", "rosu": 5, "negru": 2},
      ...
    ]
    """
    conn = _get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT category, point_type, COUNT(*)
        FROM feedback
        WHERE employee_id = %s
        GROUP BY category, point_type
    """, (user_id,))
    rows = c.fetchall()
    conn.close()

    # Process rows into structured data
    stats = {}
    for cat, ptype, count in rows:
        if not cat: 
            cat = "General"
        if cat not in stats:
            stats[cat] = {"rosu": 0, "negru": 0}
        
        if ptype == "rosu":
            stats[cat]["rosu"] = count
        elif ptype == "negru":
            stats[cat]["negru"] = count
            
    # Convert to list
    result = []
    for cat, counts in stats.items():
        result.append({
            "category": cat,
            "rosu": counts["rosu"],
            "negru": counts["negru"]
        })
    return result

# ---------------------------------------------------------------
# POWERBI EXPORT
# ---------------------------------------------------------------
def get_all_feedback(start_date: str, end_date: str):
    """
    Return feedback entries within the date range [start_date, end_date].
    Dates should be comparable strings (e.g. ISO format or YYYY-MM-DD).
    """
    conn = _get_conn()
    c = conn.cursor()
    
    # Ensure end_date includes the whole day if it's just "YYYY-MM-DD"
    if len(end_date) == 10:
        query_end = end_date + "T23:59:59"
    else:
        query_end = end_date
        
    c.execute("""
        SELECT 
            f.id,
            f.timestamp,
            m.name AS manager_name,
            e.name AS employee_name,
            f.point_type,
            f.comment,
            f.manager_id,
            f.employee_id,
            f.category
        FROM feedback f
        LEFT JOIN users m ON f.manager_id = m.id
        LEFT JOIN users e ON f.employee_id = e.id
        WHERE f.timestamp >= %s AND f.timestamp <= %s
        ORDER BY f.timestamp DESC
    """, (start_date, query_end))
    rows = c.fetchall()
    conn.close()
    
    # Convert to list of dicts for easier JSON serialization
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "timestamp": r[1],
            "manager": r[2],
            "employee": r[3],
            "type": r[4],
            "comment": r[5],
            "manager_id": r[6],
            "employee_id": r[7],
            "category": r[8]
        })
    return result


def get_admin_stats():
    """
    Returns general statistics for the admin dashboard.
    """
    from datetime import datetime, timedelta
    conn = _get_conn()
    c = conn.cursor()

    # 1) Total feedback-uri în sistem
    c.execute("SELECT COUNT(*) FROM feedback")
    total_feedback = c.fetchone()[0]

    # 2) Feedback-uri în ultimele 30 zile
    cutoff = (datetime.now() - timedelta(days=30)).isoformat()
    c.execute("""
        SELECT point_type, COUNT(*)
        FROM feedback
        WHERE timestamp >= %s
        GROUP BY point_type
    """, (cutoff,))
    rows_30 = c.fetchall()
    
    red_30 = 0
    black_30 = 0
    for pt, cnt in rows_30:
        if pt == "rosu":
            red_30 = cnt
        elif pt == "negru":
            black_30 = cnt

    # 3) Top 5 manageri după activitate
    c.execute("""
        SELECT m.name, COUNT(*)
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        GROUP BY m.id
        ORDER BY COUNT(*) DESC
        LIMIT 5
    """)
    top_managers = [{"name": r[0], "count": r[1]} for r in c.fetchall()]

    # 4) User counts by role
    c.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    role_counts = {r[0]: r[1] for r in c.fetchall()}

    conn.close()

    return {
        "total_feedback": total_feedback,
        "red_30_days": red_30,
        "black_30_days": black_30,
        "top_managers": top_managers,
        "user_counts": role_counts
    }
