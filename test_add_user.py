from services.db_users import add_user
import bcrypt

def test_add_user():
    try:
        pw_hash = bcrypt.hashpw("password".encode(), bcrypt.gensalt()).decode()
        add_user("test@example.com", "Test User", pw_hash, "Dept", "Func", "user")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_add_user()
