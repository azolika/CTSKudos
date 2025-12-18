import os
import json
import sqlite3
import bcrypt


DB_FILE = "data/feedback.db"
CONFIG_FILE = "config_generated.json"


def db_exists():
    return os.path.exists(DB_FILE)


def create_tables(conn):
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            name TEXT,
            role TEXT,
            password_hash TEXT,
            departament TEXT,
            functia TEXT,
            company TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS hierarchy(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            manager_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(manager_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_id INTEGER,
            employee_id INTEGER,
            point_type TEXT,
            comment TEXT,
            timestamp TEXT,
            FOREIGN KEY(manager_id) REFERENCES users(id),
            FOREIGN KEY(employee_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS password_reset (
            email TEXT,
            token TEXT,
            timestamp TEXT
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
            INSERT INTO users(username, name, role, password_hash, departament, functia, company)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "admin@cargotrack.ro",
            "Administrator",
            "admin",
            pw,
            "Management",
            "Administrator",
            "CargoTrack"
        ))
        conn.commit()
        print("✔ Admin user created.")


def insert_initial_data(conn):
    """Load users + hierarchy from JSON."""
    if not os.path.exists(CONFIG_FILE):
        print(f"⚠ WARNING: {CONFIG_FILE} not found, skipping initial data load.")
        return

    print(f"📥 Loading initial data from {CONFIG_FILE}...")

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    c = conn.cursor()

    # USERS
    for u in data["users"]:
        try:
            c.execute("""
                INSERT INTO users(username, name, role, password_hash, departament, functia, company)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                u["username"],
                u["name"],
                u["role"],
                u["password_hash"],
                u["departament"],
                u["functia"],
                u["company"]
            ))
        except Exception as e:
            print("⚠ User insert failed:", u["username"], e)

    conn.commit()

    # Username → ID map
    c.execute("SELECT id, username FROM users")
    map_uid = {email: uid for uid, email in c.fetchall()}

    # HIERARCHY
    for h in data["hierarchy"]:
        user_id = map_uid.get(h["user"])
        manager_id = map_uid.get(h.get("manager_email"))

        if not user_id:
            print("⚠ Missing user:", h["user"])
            continue

        c.execute("""
            INSERT INTO hierarchy(user_id, manager_id)
            VALUES (?, ?)
        """, (user_id, manager_id))

    conn.commit()
    print("✔ Initial data imported.")


def auto_init_db():
    """Main initializer. Only runs once on first deployment."""
    if db_exists():
        print("✔ Database already exists — skipping initial import.")
        return

    print("🆕 No database found. Creating a new one...")

    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    create_tables(conn)
    insert_admin_user(conn)
    insert_initial_data(conn)
    conn.close()

    print("🎉 Initial DB setup completed.")


# If you want to auto-run when imported:
auto_init_db()
