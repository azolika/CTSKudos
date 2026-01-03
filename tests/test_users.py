import pytest

def test_read_all_users_admin(client, admin_auth_header, mock_db):
    mock_db["cursor"].fetchone.return_value = (1, "admin@example.com", "Admin User", "admin", "Management", "Admin")
    mock_db["cursor"].fetchall.return_value = [
        (1, "admin@example.com", "Admin User", "admin", "Management", "Admin", None),
        (2, "user@example.com", "Regular User", "user", "IT", "Dev", 1)
    ]
    
    response = client.get("/users", headers=admin_auth_header)
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_create_user_admin(client, admin_auth_header, mock_db):
    mock_db["cursor"].fetchone.return_value = (1, "admin@example.com", "Admin User", "admin", "Management", "Admin")
    mock_db["cursor"].lastrowid = 3
    
    response = client.post(
        "/users",
        headers=admin_auth_header,
        json={
            "username": "new@example.com",
            "name": "New User",
            "role": "user",
            "password": "password123",
            "departament": "Sales",
            "functia": "Rep"
        }
    )
    
    assert response.status_code == 200
    assert response.json()["id"] == 3

def test_delete_user_non_admin_forbidden(client, auth_header, mock_db):
    mock_db["cursor"].fetchone.return_value = (1, "test@example.com", "Test User", "user", "IT", "Dev")
    
    response = client.delete("/users/2", headers=auth_header)
    assert response.status_code == 403
