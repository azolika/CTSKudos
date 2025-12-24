from db import get_db_connection
import os
import json
import bcrypt

CONFIG_FILE = "config_generated.json"

def create_tables(conn):
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
    """Ensure admin user exists."""
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM users WHERE username='admin@cargotrack.ro'")
    if c.fetchone()[0] == 0:
        pw = bcrypt.hashpw("Cargo2025!@#".encode(), bcrypt.gensalt()).decode()
        c.execute("""
            INSERT INTO users(username, name, role, password_hash, departament, functia)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            "admin@cargotrack.ro",
            "Administrator",
            "admin",
            pw,
            "Management",
            "Administrator"
        ))
        conn.commit()
        print("✔ Admin user created.")


def insert_initial_data(conn):
    """Load users + hierarchy from JSON."""
    if not os.path.exists(CONFIG_FILE):
        return

    print(f"📥 Loading initial data from {CONFIG_FILE}...")

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    c = conn.cursor()

    # USERS
    for u in data["users"]:
        try:
            c.execute("""
                INSERT INTO users(username, name, role, password_hash, departament, functia)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                u["username"],
                u["name"],
                u["role"],
                u["password_hash"],
                u["departament"],
                u["functia"]
            ))
        except Exception as e:
            pass

    conn.commit()

    # User map
    c.execute("SELECT id, username FROM users")
    map_uid = {email: uid for uid, email in c.fetchall()}

    # HIERARCHY
    for h in data["hierarchy"]:
        user_id = map_uid.get(h["user"])
        manager_id = map_uid.get(h.get("manager_email"))

        if not user_id:
            continue

        c.execute("""
            INSERT INTO hierarchy(user_id, manager_id)
            VALUES (%s, %s)
        """, (user_id, manager_id))

    conn.commit()
    print("✔ Initial data imported.")


def auto_init_db():
    """Main initializer for MariaDB."""
    try:
        conn = get_db_connection()
    except Exception:
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

if __name__ == "__main__":
    auto_init_db()
