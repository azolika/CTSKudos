
import sys
import os

# Add current dir to path to find services
sys.path.append(os.getcwd())

from services.db_feedback import get_all_feedback
from db import init_db

print("Initializing DB...")
init_db()


try:
    data = get_all_feedback()
    print(f"SUCCESS: Retrieved {len(data)} records.")
    if len(data) > 0:
        print("Sample record:", data[0])
except Exception as e:
    print(f"ERROR: {e}")
