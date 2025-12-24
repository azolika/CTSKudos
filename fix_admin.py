from db import get_db_connection
import bcrypt

def fix_admin():
    conn = get_db_connection()
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
            SET username='admin@cargotrack.ro', password_hash=%s 
            WHERE id=%s
        """, (pw_hash, user_id))
    else:
        print("Creating new admin user")
        c.execute("""
            INSERT INTO users(username, name, role, password_hash, departament, functia)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            "admin@cargotrack.ro",
            "Administrator",
            "admin",
            pw_hash,
            "Management",
            "Administrator"
        ))
    
    conn.commit()
    conn.close()
    print("✔ Admin user fixed.")
    print("✔ Admin user fixed.")

if __name__ == "__main__":
    fix_admin()
