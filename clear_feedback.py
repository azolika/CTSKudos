import sqlite3
import os

DB_PATH = "data/feedback.db"

def clear_feedback():
    print(f"Connecting to database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"Database file NOT found at {DB_PATH}")
        # In Docker, the path should be correct relative to WORKDIR /app
        return

    conn = sqlite3.connect(DB_PATH)
    try:
        c = conn.cursor()
        
        # Check current count
        c.execute("SELECT COUNT(*) FROM feedback")
        count = c.fetchone()[0]
        print(f"Current feedback count: {count}")
        
        if count == 0:
            print("Table is already empty.")
            return

        # Confirm (skip if running non-interactively in some contexts, but let's be safe)
        # For a script intended to be run via docker exec, arguments are better, 
        # but let's just do it directly as requested "delete all data".
        
        c.execute("DELETE FROM feedback")
        conn.commit()
        
        # Verify
        c.execute("SELECT COUNT(*) FROM feedback")
        new_count = c.fetchone()[0]
        print(f"Deleted {count} entries. New count: {new_count}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    clear_feedback()
