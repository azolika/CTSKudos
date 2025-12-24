import pymysql
import bcrypt
import os
import time

def get_db_connection(include_db=True, use_root=False):
    """
    Returns a MariaDB connection using env variables.
    If include_db is False, connects to the server without selecting a database.
    """
    user = os.getenv("DB_USER", "kudos_user")
    password = os.getenv("DB_PASSWORD", "kudos_pass")
    
    if use_root:
        user = "root"
        password = os.getenv("DB_ROOT_PASSWORD", "root_pass")

    return pymysql.connect(
        host=os.getenv("DB_HOST", "mariadb"),
        user=user,
        password=password,
        database=os.getenv("DB_NAME", "kudos_db") if include_db else None,
        autocommit=True,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.Cursor
    )

def init_db():
    """Create all required tables if they don't exist."""
    
    db_name = os.getenv("DB_NAME", "kudos_db")
    
    # 1. Wait for MariaDB server and ensure DB exists
    retries = 20
    conn = None
    while retries > 0:
        try:
            # Try connecting with normal user first
            conn = get_db_connection(include_db=False)
            print("✔ Connected as normal user.")
        except Exception as e:
            # If normal user fails, try as root to fix permissions/create DB
            try:
                print(f"⌛ Normal user connection failed ({e}). Trying as root...")
                conn = get_db_connection(include_db=False, use_root=True)
                print("✔ Connected as root.")
                # Ensure normal user has permissions
                with conn.cursor() as c:
                    user = os.getenv("DB_USER", "kudos_user")
                    password = os.getenv("DB_PASSWORD", "kudos_pass")
                    c.execute(f"CREATE USER IF NOT EXISTS '{user}'@'%' IDENTIFIED BY '{password}'")
                    c.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{user}'@'%' WITH GRANT OPTION")
                    c.execute("FLUSH PRIVILEGES")
                    print(f"✔ Permissions granted to '{user}'@'%'.")
            except Exception as root_e:
                print(f"⌛ MariaDB not ready yet (Root also failed: {root_e}). Retrying in 5s... ({retries} left)")
                retries -= 1
                if conn: conn.close()
                time.sleep(5)
                continue
            
        # If we reach here, we have a connection (either user or root)
        try:
            # Ensure the database exists
            with conn.cursor() as c:
                c.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            conn.select_db(db_name)
            print(f"✔ Database '{db_name}' is ready.")
            break
        except Exception as e:
            print(f"❌ Error during DB selection: {e}")
            retries -= 1
            if conn: conn.close()
            time.sleep(5)
    
    if not conn:
        print("❌ CRITICAL: Could not connect to MariaDB after several attempts.")
        return

    try:
        with conn.cursor() as c:
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
            ) ENGINE=InnoDB;
            """)

            # HIERARCHY table
            c.execute("""
            CREATE TABLE IF NOT EXISTS hierarchy(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                manager_id INT,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
            """)

            # FEEDBACK table
            c.execute("""
            CREATE TABLE IF NOT EXISTS feedback(
                id INT AUTO_INCREMENT PRIMARY KEY,
                manager_id INT,
                employee_id INT,
                point_type VARCHAR(50),
                comment TEXT,
                timestamp VARCHAR(100),
                category VARCHAR(100) DEFAULT 'General',
                FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY(employee_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
            """)

            # PASSWORD RESET TOKENS
            c.execute("""
            CREATE TABLE IF NOT EXISTS password_reset (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255),
                token VARCHAR(255),
                timestamp VARCHAR(100)
            ) ENGINE=InnoDB;
            """)

            # Create default admin user
            admin_email = 'admin@cargotrack.ro'
            c.execute("SELECT COUNT(*) FROM users WHERE username = %s", (admin_email,))
            if c.fetchone()[0] == 0:
                pw_hash = bcrypt.hashpw("Cargo2025!@#".encode(), bcrypt.gensalt()).decode()
                c.execute("""
                    INSERT INTO users(username, name, role, password_hash)
                    VALUES (%s, %s, %s, %s)
                """, (admin_email, "Administrator", "admin", pw_hash))
                print("✔ Default admin user created.")

    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
    finally:
        if conn:
            conn.close()
