from fastapi import FastAPI
from services.db_feedback import get_all_feedback
from services.db_users import get_all_users_export

app = FastAPI(title="Kudos Data Export API")

@app.get("/users")
def read_users():
    """
    Get all users (for data sync/export).
    """
    return get_all_users_export()

@app.get("/feedback")
def read_feedback(from_date: str, to_date: str):
    """
    Get feedback data filtered by date range.
    
    - **from_date**: Start date (inclusive), e.g., '2023-01-01'
    - **to_date**: End date (inclusive), e.g., '2023-12-31'
    """
    data = get_all_feedback(from_date, to_date)
    return data

@app.get("/")
def read_root():
    return {"message": "Kudos API is running. Go to /docs for Swagger UI."}
