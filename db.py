import mysql.connector
import bcrypt
import os
import time

def get_db_connection():
    """Returns a MariaDB connection using env variables."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "mariadb"),
        database=os.getenv("DB_NAME", "kudos_db"),
        user=os.getenv("DB_USER", "kudos_user"),
        password=os.getenv("DB_PASSWORD", "kudos_pass"),
        autocommit=True
    )

def init_db():
    """Create all required tables if they don't exist."""
    
    # Wait for MariaDB to be ready (useful for first-time startup in Docker)
    retries = 5
    conn = None
    while retries > 0:
        try:
            conn = get_db_connection()
            break
        except Exception as e:
            print(f"Waiting for database... ({e})")
            retries -= 1
            time.sleep(5)
    
    if not conn:
        print("Could not connect to database. Exiting.")
        return

    c = conn.cursor()

    # USERS table
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

    # HIERARCHY table
    c.execute("""
    CREATE TABLE IF NOT EXISTS hierarchy(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        manager_id INT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE SET NULL
    )
    """)

    # FEEDBACK table
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

    # PASSWORD RESET TOKENS
    c.execute("""
    CREATE TABLE IF NOT EXISTS password_reset (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        token VARCHAR(255),
        timestamp DATETIME
    )
    """)

    # Create default admin user if missing
    admin_email = 'admin@cargotrack.ro'
    c.execute("SELECT COUNT(*) FROM users WHERE username = %s", (admin_email,))
    if c.fetchone()[0] == 0:
        pw_hash = bcrypt.hashpw("Cargo2025!@#".encode(), bcrypt.gensalt()).decode()
        c.execute("""
            INSERT INTO users(username, name, role, password_hash)
            VALUES (%s, %s, %s, %s)
        """, (admin_email, "Administrator", "admin", pw_hash))
        conn.commit()

    conn.close()
