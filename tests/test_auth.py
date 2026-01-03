import pytest
from unittest.mock import MagicMock

def test_get_config(client):
    response = client.get("/config")
    assert response.status_code == 200
    assert "departments" in response.json()

def test_get_categories(client):
    response = client.get("/config/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "Productivitate" in response.json()

def test_login_success(client, mock_db):
    import bcrypt
    from services.auth import authenticate_user
    
    # Mock user in DB
    hashed_pw = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
    mock_db["cursor"].fetchone.return_value = (1, "test@example.com", "Test User", "user", hashed_pw, "IT", "Dev")
    
    response = client.post(
        "/auth/login",
        data={"username": "test@example.com", "password": "password123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "test@example.com"

def test_login_failure(client, mock_db):
    mock_db["cursor"].fetchone.return_value = None # No user found
    
    response = client.post(
        "/auth/login",
        data={"username": "wrong@example.com", "password": "any"}
    )
    
    assert response.status_code == 401

def test_get_me(client, auth_header, mock_db):
    # Mock user for get_current_user
    mock_db["cursor"].fetchone.return_value = (1, "test@example.com", "Test User", "user", "IT", "Dev")
    
    response = client.get("/auth/me", headers=auth_header)
    assert response.status_code == 200
    assert response.json()["username"] == "test@example.com"
