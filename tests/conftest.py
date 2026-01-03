import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from api import app

@pytest.fixture
def mock_db():
    with patch("db.pymysql.connect") as mock_connect:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_connect.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        
        # Default fetchall/fetchone behavior
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = None
        
        yield {
            "conn": mock_conn,
            "cursor": mock_cursor,
            "connect": mock_connect
        }

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_header(mock_db):
    # Mocking get_user_by_id for authenticate_user and get_current_user
    # (id, username, name, role, hash, dept, func)
    mock_user = (1, "test@example.com", "Test User", "user", "hashed_pw", "IT", "Dev")
    mock_db["cursor"].fetchone.return_value = mock_user
    
    from services.auth import create_access_token
    token = create_access_token(data={"sub": "test@example.com", "id": 1, "role": "user"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_auth_header(mock_db):
    mock_user = (1, "admin@example.com", "Admin User", "admin", "hashed_pw", "Management", "Admin")
    mock_db["cursor"].fetchone.return_value = mock_user
    
    from services.auth import create_access_token
    token = create_access_token(data={"sub": "admin@example.com", "id": 1, "role": "admin"})
    return {"Authorization": f"Bearer {token}"}
