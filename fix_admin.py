import sqlite3
import bcrypt

DB_FILE = "data/feedback.db"

def fix_admin():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Check if admin exists
    c.execute("SELECT id, username FROM users WHERE username='admin' OR username='admin@cargotrack.ro'")
    row = c.fetchone()
    
    password = "Cargo2025!@#"
    pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if row:
        user_id = row[0]
        print(f"Updating existing user ID {user_id} to admin@cargotrack.ro")
        c.execute("""
            UPDATE users 
            SET username='admin@cargotrack.ro', password_hash=? 
            WHERE id=?
        """, (pw_hash, user_id))
    else:
        print("Creating new admin user")
        c.execute("""
            INSERT INTO users(username, name, role, password_hash, departament, functia, company)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "admin@cargotrack.ro",
            "Administrator",
            "admin",
            pw_hash,
            "Management",
            "Administrator",
            "CargoTrack"
        ))
    
    conn.commit()
    conn.close()
    print("✔ Admin user fixed.")

if __name__ == "__main__":
    fix_admin()
