import sqlite3
conn = sqlite3.connect('data/feedback.db')
c = conn.cursor()
for table in ['users', 'hierarchy', 'feedback']:
    c.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table}'")
    row = c.fetchone()
    if row:
        print(f"--- {table} ---")
        print(row[0])
conn.close()
