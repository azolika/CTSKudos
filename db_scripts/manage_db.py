import sys
import os
import json
import bcrypt
import argparse

# Add parent directory to path to import db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import get_db_connection

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "config_generated.json")

def create_tables(conn):
    """Create all required tables."""
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE,
            name VARCHAR(255),
            role VARCHAR(50),
            password_hash VARCHAR(255),
            departament VARCHAR(255),
            functia VARCHAR(255)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS hierarchy(
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            manager_id INT,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE SET NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback(
            id INT AUTO_INCREMENT PRIMARY KEY,
            manager_id INT,
            employee_id INT,
            point_type VARCHAR(50),
            comment TEXT,
            timestamp DATETIME,
            category VARCHAR(100) DEFAULT 'General',
            FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY(employee_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS password_reset (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255),
            token VARCHAR(255),
            timestamp DATETIME
        )
    """)
    conn.commit()

def insert_admin_user(conn):
    """Ensure admin user exists with default credentials."""
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE username='admin@cargotrack.ro'")
    if c.fetchone()[0] == 0:
        pw = bcrypt.hashpw("Cargo2025!@#".encode(), bcrypt.gensalt()).decode()
        c.execute("""
            INSERT INTO users(username, name, role, password_hash, departament, functia)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, ("admin@cargotrack.ro", "Administrator", "admin", pw, "Management", "Administrator"))
        conn.commit()
        print("✔ Default admin user created.")

def insert_initial_data(conn):
    """Load users + hierarchy from config_generated.json."""
    if not os.path.exists(CONFIG_FILE):
        print(f"⚠ {CONFIG_FILE} not found. Skipping initial data import.")
        return

    print(f"📥 Loading initial data from {CONFIG_FILE}...")
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    c = conn.cursor()
    for u in data["users"]:
        try:
            c.execute("""
                INSERT INTO users(username, name, role, password_hash, departament, functia)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (u["username"], u["name"], u["role"], u["password_hash"], u["departament"], u["functia"]))
        except: pass
    conn.commit()

    c.execute("SELECT id, username FROM users")
    map_uid = {email: uid for uid, email in c.fetchall()}

    for h in data["hierarchy"]:
        user_id = map_uid.get(h["user"])
        manager_id = map_uid.get(h.get("manager_email"))
        if user_id:
            c.execute("INSERT INTO hierarchy(user_id, manager_id) VALUES (%s, %s)", (user_id, manager_id))
    conn.commit()
    print("✔ Initial data imported.")

def auto_init_db():
    """Run initial database setup if the users table is empty."""
    try:
        conn = get_db_connection()
    except:
        print("⚠ Could not connect to MariaDB for auto-init.")
        return

    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] > 0:
        print("✔ Database already has data — skipping initial import.")
        conn.close()
        return

    print("🆕 Database is empty. Running initial setup...")
    create_tables(conn)
    insert_admin_user(conn)
    insert_initial_data(conn)
    conn.close()
    print("🎉 Initial setup completed.")

def fix_admin():
    """Reset/Fix admin account credentials."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username='admin' OR username='admin@cargotrack.ro'")
    row = c.fetchone()
    
    password = "Cargo2025!@#"
    pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if row:
        print(f"Updating existing admin (ID: {row[0]}) to admin@cargotrack.ro and resetting password.")
        c.execute("UPDATE users SET username='admin@cargotrack.ro', password_hash=%s WHERE id=%s", (pw_hash, row[0]))
    else:
        print("Creating new admin user.")
        c.execute("""
            INSERT INTO users(username, name, role, password_hash, departament, functia)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, ("admin@cargotrack.ro", "Administrator", "admin", pw_hash, "Management", "Administrator"))
    
    conn.commit()
    conn.close()
    print("✔ Admin user fixed.")

def delete_all_feedback(noprompt=False):
    """Truncate the feedback table."""
    print("WARNING: This will delete ALL feedback from the database.")
    if not noprompt:
        confirm = input("Are you sure? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Operation cancelled.")
            return

    conn = get_db_connection()
    try:
        with conn.cursor() as c:
            c.execute("DELETE FROM feedback")
            print(f"Deleted {c.rowcount} feedback entries.")
        conn.commit()
        print("✔ All feedback deleted successfully.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def reset_database(noprompt=False):
    """Drop all tables and re-initialize everything."""
    print("🛑 WARNING: This will delete EVERYTHING (Users, Hierarchy, Feedback)!")
    if not noprompt:
        confirm = input("Are you sure you want to completely nuked the database? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Operation cancelled.")
            return

    conn = get_db_connection()
    try:
        with conn.cursor() as c:
            print("Dropping tables...")
            c.execute("SET FOREIGN_KEY_CHECKS = 0")
            c.execute("DROP TABLE IF EXISTS feedback")
            c.execute("DROP TABLE IF EXISTS hierarchy")
            c.execute("DROP TABLE IF EXISTS password_reset")
            c.execute("DROP TABLE IF EXISTS users")
            c.execute("SET FOREIGN_KEY_CHECKS = 1")
            conn.commit()
            print("✔ All tables dropped.")
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        return
    finally:
        conn.close()

    # Re-initialize everything
    print("Re-initializing database...")
    auto_init_db()
    print("✔ Database reset to initial state.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kudos Database Management Tool")
    parser.add_argument("command", choices=["init", "fix-admin", "clear-feedback", "reset-db"], help="Command to execute")
    parser.add_argument("--noprompt", action="store_true", help="Skip confirmation for destructive actions")

    args = parser.parse_args()

    if args.command == "init":
        auto_init_db()
    elif args.command == "fix-admin":
        fix_admin()
    elif args.command == "clear-feedback":
        delete_all_feedback(args.noprompt)
    elif args.command == "reset-db":
        reset_database(args.noprompt)
