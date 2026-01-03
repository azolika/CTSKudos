import pytest

def test_create_feedback_success(client, auth_header, mock_db):
    # Mock recipient user check (not an admin)
    # mock_db["cursor"] is reused, we need to handle sequential calls if any
    # api.py: create_feedback calls get_user_by_id(feedback.employee_id)
    # and then add_feedback calls _get_conn()...
    
    mock_db["cursor"].fetchone.side_effect = [
        (2, "recipient@example.com", "Recipient", "user", "Dept", "Func"), # for recipient check
        (1, "test@example.com", "Test User", "user", "IT", "Dev"), # for get_current_user in auth
    ]
    
    response = client.post(
        "/feedback",
        headers=auth_header,
        json={
            "employee_id": 2,
            "point_type": "rosu",
            "comment": "Well done!",
            "category": "General"
        }
    )
    
    assert response.status_code == 200
    assert response.json()["message"] == "Feedback added successfully"

def test_create_feedback_unauthorized_black_point(client, auth_header, mock_db):
    # Standard user cannot send 'negru' points
    mock_db["cursor"].fetchone.side_effect = [
        (2, "recipient@example.com", "Recipient", "user", "Dept", "Func"), # recipient check
        (1, "test@example.com", "Test User", "user", "IT", "Dev"), # auth
    ]
    
    response = client.post(
        "/feedback",
        headers=auth_header,
        json={
            "employee_id": 2,
            "point_type": "negru",
            "comment": "Bad job",
            "category": "General"
        }
    )
    
    assert response.status_code == 403
    assert "doar puncte roșii" in response.json()["detail"]

def test_get_my_feedback(client, auth_header, mock_db):
    # Mock user for auth
    # And mock feedback data
    mock_db["cursor"].fetchone.return_value = (1, "test@example.com", "Test User", "user", "IT", "Dev")
    mock_db["cursor"].fetchall.return_value = [
        ("rosu", "Great!", "2024-01-01 10:00:00", "Manager Name", "General", False)
    ]
    
    response = client.get("/feedback/my", headers=auth_header)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["comment"] == "Great!"
