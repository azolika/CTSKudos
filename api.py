from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from services.auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from services.db_users import (
    get_all_users_export, 
    get_user_by_id, 
    get_subordinates, 
    get_manager_for_user,
    set_manager_for_user,
    add_user,
    update_user,
    delete_user,
    update_user_password,
    get_user_id_by_username,
    create_password_reset_token,
    get_email_by_reset_token
)
from services.emailer import send_email
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from services.db_feedback import (
    add_feedback,
    get_feedback_for_employee,
    get_feedback_for_user,
    get_last_feedback,
    get_all_feedback as get_all_feedback_export,
    get_feedback_points_for_subordinates,
    get_admin_stats
)
import bcrypt
import json

app = FastAPI(title="Kudos API")

from db import init_db

@app.on_event("startup")
def on_startup():
    init_db()

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
@app.get("/config")
async def get_config():
    if not os.path.exists("config.json"):
        return {"departments": {}}
    with open("config.json", "r", encoding="utf-8") as f:
        return json.load(f)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://localhost:9000",
    "http://localhost:9005",
    "http://192.168.88.166:9005",
    "http://127.0.0.1:5173",
    "http://192.168.88.175:9005",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http?://(localhost|127\.0\.0\.1|192\.168\.88\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# CATEGORIES
# ---------------------------------------------------------
FEEDBACK_CATEGORIES = [
    "Productivitate",
    "Calitate",
    "Muncă în echipă",
    "Comunicare",
    "Inițiativă",
    "Punctualitate",
    "Creativitate",
    "Seriozitate",
    "Abilități tehnice",
    "Leadership"
]

@app.get("/config/categories")
async def get_feedback_categories():
    return FEEDBACK_CATEGORIES

# ---------------------------------------------------------
# MODELS
# ---------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    id: int
    username: str
    name: str = ""
    role: str = "user"
    departament: Optional[str] = ""
    functia: Optional[str] = ""

class FeedbackCreate(BaseModel):
    employee_id: int
    point_type: str  # 'rosu', 'negru'
    comment: str
    category: str = "General"  # Default to General if not provided

class UserCreate(BaseModel):
    username: str
    name: str
    role: str
    password: str
    departament: str = ""
    functia: str = ""

class UserUpdate(BaseModel):
    name: str
    role: str
    departament: str = ""
    functia: str = ""

class PasswordUpdate(BaseModel):
    new_password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# ---------------------------------------------------------
# AUTH ENDPOINTS
# ---------------------------------------------------------
@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    # user tuple: (id, username, name, role, hash, dept, func)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user or incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user[1], 
        "id": user[0], 
        "role": user[3]
    }
    access_token = create_access_token(
        data=token_payload, expires_delta=access_token_expires
    )
    
    user_dict = {
        "id": user[0],
        "username": user[1],
        "name": user[2],
        "role": user[3],
        "departament": user[5],
        "functia": user[6]
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@app.get("/auth/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/auth/forgot-password")
async def forgot_password(req: PasswordResetRequest):
    email = req.email.strip().lower()
    user_id = get_user_id_by_username(email)
    
    if user_id:
        token = create_password_reset_token(email)
        app_base_url = os.getenv("APP_BASE_URL", "http://localhost:5173")
        reset_link = f"{app_base_url}/reset-password?token={token}"
        
        html = f"""
        <h2>Resetare parolă</h2>
        <p>Pentru a reseta parola contului tău, accesează link-ul de mai jos:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <br>
        <p>Dacă nu ai cerut resetarea parolei, poți ignora acest email.</p>
        <br>
        <p>Cu stimă,<br>
        Echipa <strong>Kudos by CargoTrack</strong></p>
        """
        send_email(email, "Resetare parolă - Kudos by CargoTrack", html)
        
    # Always return success to avoid email enumeration
    return {"message": "Dacă adresa există în sistem, vei primi un email cu instrucțiuni."}

@app.post("/auth/reset-password")
async def reset_password(req: PasswordResetConfirm):
    email = get_email_by_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Token invalid sau expirat")
        
    hashed = bcrypt.hashpw(req.new_password.encode(), bcrypt.gensalt()).decode()
    update_user_password(email, hashed)
    return {"message": "Parola a fost resetată cu succes!"}

# ---------------------------------------------------------
# FEEDBACK ENDPOINTS
# ---------------------------------------------------------
@app.post("/feedback")
async def create_feedback(
    feedback: FeedbackCreate, 
    current_user: dict = Depends(get_current_user)
):
    # Ensure recipient is NOT an admin
    recipient = get_user_by_id(feedback.employee_id)
    if not recipient or recipient[3] == "admin":
        raise HTTPException(
            status_code=403, 
            detail="Nu se pot acorda puncte sau Kudos administratorilor."
        )

    role = current_user["role"]
    
    # Validation: regular users can ONLY send positive feedback (rosu)
    if role == "user":
        if feedback.point_type != "rosu":
            raise HTTPException(
                status_code=403, 
                detail="Utilizatorii obișnuiți pot trimite doar puncte roșii (Kudos)."
            )
    elif role not in ["manager/tl", "admin"]:
        raise HTTPException(status_code=403, detail="Nu aveți permisiunea de a trimite feedback.")
        
    add_feedback(
        manager_id=current_user["id"],
        employee_id=feedback.employee_id,
        point_type=feedback.point_type,
        comment=feedback.comment,
        category=feedback.category
    )
    return {"message": "Feedback added successfully"}

@app.get("/feedback/my")
async def read_my_feedback(since: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get feedback received by the current user."""
    # Using get_feedback_for_user which includes manager names
    raw_data = get_feedback_for_user(current_user["id"], since=since)
    # raw_data: (point_type, comment, timestamp, manager_name, category)
    results = []
    for r in raw_data:
        # r: (point_type, comment, timestamp, manager_name, category, is_manager)
        results.append({
            "point_type": r[0],
            "comment": r[1],
            "timestamp": r[2],
            "manager_name": r[3],
            "category": r[4] if len(r) > 4 else "General",
            "is_manager_feedback": r[5] if len(r) > 5 else True
        })
    return results

@app.get("/feedback/team")
async def read_team_feedback(since: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get all feedback points for subordinates, including official/peer tag."""
    # 1. Get subordinates
    subs = get_subordinates(current_user["id"])
    sub_ids = [s[0] for s in subs]
    if not sub_ids:
        return []
    
    # 2. Get feedback for them
    raw_data = get_feedback_points_for_subordinates(sub_ids, since=since)
    
    # 3. Build a lookup for "who reports to whom" across the whole org
    from db import get_db_connection
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT user_id, manager_id FROM hierarchy")
    hierarchy_rows = c.fetchall()
    conn.close()
    
    # Building a direct manager map: recipient_id -> manager_id
    manager_map = {r[0]: r[1] for r in hierarchy_rows}
    
    # helper to check if someone is a superior (handles recursive chain)
    def check_is_superior(sender_id, recipient_id, m_map):
        curr = recipient_id
        visited = set()
        while curr in m_map and curr not in visited:
            visited.add(curr)
            mgr = m_map[curr]
            if mgr == sender_id:
                return True
            curr = mgr
        return False

    # 4. Process and return with the is_manager_feedback flag
    results = []
    for r in raw_data:
        # r: (point_type, employee_id, manager_id)
        is_official = check_is_superior(sender_id=r[2], recipient_id=r[1], m_map=manager_map)
        results.append({
            "point_type": r[0],
            "employee_id": r[1],
            "is_manager_feedback": is_official
        })
    return results

@app.get("/feedback/employee/{employee_id}")
async def read_employee_feedback(employee_id: int, since: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get full feedback history for a specific employee."""
    # Security: check if employee is subordinate if not admin
    if current_user["role"] != "admin":
        subs = get_subordinates(current_user["id"])
        sub_ids = [s[0] for s in subs]
        if employee_id not in sub_ids:
             raise HTTPException(status_code=403, detail="Not authorized to view this employee's feedback")
    
    raw_data = get_feedback_for_user(employee_id, since=since)
    # raw_data: (point_type, comment, timestamp, manager_name, category)
    return [
        {
            "point_type": r[0],
            "comment": r[1],
            "timestamp": r[2],
            "manager_name": r[3],
            "category": r[4] if len(r) > 4 else "General",
            "is_manager_feedback": r[5] if len(r) > 5 else True
        } for r in raw_data
    ]

@app.get("/feedback/export")
async def export_feedback(from_date: str, to_date: str):
    return get_all_feedback_export(from_date, to_date)


@app.get("/admin/stats")
async def read_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return get_admin_stats()


@app.get("/feedback/stats/categories/{target_user_id}")
async def read_user_category_stats(target_user_id: int, since: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get feedback statistics by category for a specific user."""
    
    # Permission check
    is_admin = current_user["role"] == "admin"
    is_self = current_user["id"] == target_user_id
    
    is_subordinate = False
    if not is_admin and not is_self and current_user["role"] == "manager/tl":
         subs = get_subordinates(current_user["id"])
         sub_ids = [s[0] for s in subs]
         if target_user_id in sub_ids:
             is_subordinate = True
    
    if not (is_admin or is_self or is_subordinate):
        raise HTTPException(status_code=403, detail="Not authorized to view stats for this user")

    from services.db_feedback import get_user_stats_by_category
    return get_user_stats_by_category(target_user_id, since=since)


# ---------------------------------------------------------
# USER & HIERARCHY ENDPOINTS
# ---------------------------------------------------------
@app.get("/users/subordinates")
async def get_my_subordinates(current_user: dict = Depends(get_current_user)):
    """Get subordinates for current manager."""
    rows = get_subordinates(current_user["id"])
    # rows: id, name, role, dept, functia
    data = []
    for r in rows:
        data.append({
            "id": r[0],
            "name": r[1],
            "role": r[2],
            "departament": r[3],
            "functia": r[4]
        })
    return data

@app.get("/users")
async def read_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users (for Admin or global lists)."""
    # Assuming standard users can also see list to pick from?
    # Or restrict to admin?
    return get_all_users_export()

@app.post("/users")
async def create_new_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Hash password
    pw_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    try:
        new_id = add_user(user.username, user.name, pw_hash, user.departament, user.functia, user.role)
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "User created", "id": new_id}

@app.put("/users/{user_id}")
async def update_existing_user(user_id: int, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    update_user(user_id, user.name, user.role, user.departament, user.functia)
    return {"message": "User updated"}

@app.delete("/users/{user_id}")
async def delete_existing_user(user_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    print(f"Deleting user {user_id} by admin {current_user['id']}")
    delete_user(user_id)
    return {"message": "User deleted"}

@app.put("/users/{user_id}/manager")
async def set_manager(user_id: int, manager_id: Optional[int] = Body(embed=True), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    set_manager_for_user(user_id, manager_id)
    return {"message": "Manager updated"}

@app.put("/users/{user_id}/password")
async def admin_change_password(user_id: int, pw: PasswordUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # We need username to use db_users.update_user_password
    target_user = get_user_by_id(user_id) # returns tuple
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    username = target_user[1]
    hashed = bcrypt.hashpw(pw.new_password.encode(), bcrypt.gensalt()).decode()
    update_user_password(username, hashed)
    return {"message": "Password updated"}
