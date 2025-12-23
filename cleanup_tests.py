import sqlite3
conn = sqlite3.connect('data/feedback.db')
c = conn.cursor()
c.execute("DELETE FROM users WHERE username IN ('test@example.com', 'newuser@cargotrack.ro')")
conn.commit()
print(f"Deleted {c.rowcount} test users.")
conn.close()
