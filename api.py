from fastapi import FastAPI
from services.db_feedback import get_all_feedback

app = FastAPI(title="Kudos Data Export API")

@app.get("/feedback")
def read_feedback():
    """
    Get all feedback data.
    """
    data = get_all_feedback()
    return data

@app.get("/")
def read_root():
    return {"message": "Kudos API is running. Go to /docs for Swagger UI."}
