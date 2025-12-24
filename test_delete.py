from services.db_users import delete_user
import sqlite3

def test_delete():
    conn = sqlite3.connect('data/feedback.db')
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username='todelete@test.com'")
    row = c.fetchone()
    if not row:
        print("User not found")
        return
    
    uid = row[0]
    print(f"Deleting user {uid}")
    delete_user(uid)
    
    c.execute("SELECT id FROM users WHERE id=?", (uid,))
    if not c.fetchone():
        print("User deleted successfully")
    else:
        print("User still exists!")
    conn.close()

if __name__ == "__main__":
    test_delete()
