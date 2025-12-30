import sys
import os

# Add parent directory to path to import db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import get_db_connection

def delete_all_feedback():
    print("WARNING: This will delete ALL feedback from the database.")
    
    # Check for 'noprompt' argument to skip confirmation (useful for automation)
    if not (len(sys.argv) > 1 and sys.argv[1] == '--noprompt'):
        confirm = input("Are you sure you want to delete all feedback? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Operation cancelled.")
            return

    conn = get_db_connection()
    try:
        with conn.cursor() as c:
            c.execute("DELETE FROM feedback")
            deleted_count = c.rowcount
            print(f"Deleted {deleted_count} feedback entries.")
        conn.commit()
        print("✔ All feedback deleted successfully.")
    except Exception as e:
        print(f"❌ Error deleting feedback: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    delete_all_feedback()
