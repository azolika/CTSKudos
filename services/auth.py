import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services.db_users import get_user_id_by_username, get_user_by_id
import bcrypt
import sqlite3

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_change_me_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ---------------------------------------------------------
# PASSWORD HELPERS
# ---------------------------------------------------------
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_username_unsafe(username: str):
    """
    Get user with password hash for authentication.
    Re-implements logic safely to avoid circular deps or exposing hashes too broadly.
    """
    username = username.strip().lower()
    conn = sqlite3.connect("data/feedback.db", timeout=20)
    c = conn.cursor()
    c.execute("SELECT id, username, name, role, password_hash, departament, functia FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return row

def authenticate_user(username: str, password: str):
    user = get_user_by_username_unsafe(username) # (id, username, name, role, hash, dept, func)
    if not user:
        return False
    
    password_hash = user[4]
    if not verify_password(password, password_hash):
        return False
        
    return user

# ---------------------------------------------------------
# JWT HELPERS
# ---------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---------------------------------------------------------
# DEPENDENCY
# ---------------------------------------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        
        if username is None or user_id is None:
            raise credentials_exception
            
        token_data = {"username": username, "id": user_id, "role": role}
    except JWTError:
        raise credentials_exception
        
    # Optional: Check if user still exists in DB
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
        
    return {
        "id": user[0],
        "username": user[1],
        "name": user[2],
        "role": user[3],
        "departament": user[4],
        "functia": user[5]
    }
