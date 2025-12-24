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
    try:
        employee = get_user_by_id(employee_id)
        manager = get_user_by_id(manager_id)
        
        if employee:
            to_email = employee[1]  # username = email
            employee_name = employee[2]
            manager_name = manager[2] if manager else "Manager"

            app_url = os.getenv("APP_BASE_URL", "http://localhost:5173")
            
            # Use labels for the email
            point_label = "Punct Roșu" if point_type == "rosu" else "Punct Negru"

            html_body = f"""
                <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(to right, #3b82f6, #1d4ed8); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Kudos by CargoTrack</h1>
                    </div>
                    <div style="padding: 30px; line-height: 1.6;">
                        <h2 style="color: #0f172a; margin-top: 0;">Ați primit un feedback nou!</h2>
                        <p>Bună, <strong>{employee_name}</strong>,</p>
                        <p>Ai primit un feedback nou de la <strong>{manager_name}</strong> în cadrul aplicației <strong>Kudos</strong>.</p>
                        
                        <p>Puteți accesa aplicația pentru a vedea istoricul complet aici:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{app_url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accesează Aplicația</a>
                        </p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="font-size: 14px; color: #64748b; text-align: center;">
                            Cu stimă,<br>
                            Echipa <strong>Kudos by CargoTrack</strong>
                        </p>
                    </div>
                </div>
            """
            send_email(
                to_email=to_email,
                subject=f"Feedback nou: {point_label}",
                html_body=html_body
            )
    except Exception as e:
        print(f"ERROR in feedback email notification: {e}")



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


def get_feedback_for_user(user_id: int, since: str = None):
    """
    Returns feedback with manager names (used in manager.py and user_page.py).
    Returns rows: (point_type, comment, timestamp, manager_name, category)
    """
    conn = _get_conn()
    c = conn.cursor()
    
    query = """
        SELECT f.point_type, f.comment, f.timestamp, m.name, f.category
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        WHERE f.employee_id = %s
    """
    params = [user_id]
    
    if since:
        query += " AND f.timestamp >= %s"
        params.append(since)
    
    query += " ORDER BY f.timestamp DESC"
    
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return rows


# ---------------------------------------------------------------
# TEAM FEEDBACK SUMMARY (USED IN MANAGER DASHBOARD)
# ---------------------------------------------------------------

def get_feedback_points_for_subordinates(sub_ids: list[int], since: str = None):
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
    query = f"SELECT point_type, employee_id FROM feedback WHERE employee_id IN ({placeholders})"
    params = list(sub_ids)
    
    if since:
        query += " AND timestamp >= %s"
        params.append(since)
        
    c.execute(query, params)
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


def get_user_stats_by_category(user_id: int, since: str = None):
    """
    Returns a list of dicts:
    [
      {"category": "Communication", "rosu": 5, "negru": 2},
      ...
    ]
    """
    conn = _get_conn()
    c = conn.cursor()
    
    query = """
        SELECT category, point_type, COUNT(*)
        FROM feedback
        WHERE employee_id = %s
    """
    params = [user_id]
    
    if since:
        query += " AND timestamp >= %s"
        params.append(since)
        
    query += " GROUP BY category, point_type"
    
    c.execute(query, params)
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
