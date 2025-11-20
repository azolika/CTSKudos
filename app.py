import streamlit as st
import streamlit_authenticator as stauth
import sqlite3
from db import init_db
import admin
import manager
from user_page import user_page_main


# ---------------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------------
st.set_page_config(page_title="Feedback App", layout="centered")

# ---------------------------------------------------------
# INIT DATABASE
# ---------------------------------------------------------
init_db()


# ---------------------------------------------------------
# LOAD USERS FOR AUTHENTICATION
# ---------------------------------------------------------
def load_users():
    """
    Returns:
        usernames: list of login usernames
        names: list of full names (display names)
        password_hashes: list of bcrypt hashes
    """
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT username, name, password_hash FROM users")
    rows = c.fetchall()
    conn.close()

    usernames = []
    names = []
    password_hashes = []

    for username, fullname, pw_hash in rows:
        usernames.append(username)
        names.append(fullname)
        password_hashes.append(pw_hash)

    return usernames, names, password_hashes


# load authentication data
usernames, names, password_hashes = load_users()

# streamlit_authenticator credentials dict
credentials = {
    "usernames": {
        u: {"name": n, "password": p}
        for u, n, p in zip(usernames, names, password_hashes)
    }
}


authenticator = stauth.Authenticate(
    credentials,
    "feedback_cookie",
    "feedback_key",
    cookie_expiry_days=1
)


# ---------------------------------------------------------
# LOGIN FORM
# ---------------------------------------------------------
name, auth_status, username = authenticator.login(
    location="main",
    fields={"Form name": "Autentificare"}
)
#st.write("DEBUG CREDENTIALS:", credentials)

if auth_status is False:
    st.error("Nume sau parolă incorectă!")
    st.stop()

if auth_status is None:
    st.warning("Introduceți numele și parola.")
    st.stop()


# ---------------------------------------------------------
# AFTER LOGIN
# ---------------------------------------------------------
authenticator.logout("Logout", "sidebar")

st.title("Kudos by CargoTrack")
# logged username = login username
login_username = username  # "username" returned by authenticator is login username

# ---------------------------------------------------------
# GET USER ROLE
# ---------------------------------------------------------
conn = sqlite3.connect("feedback.db")
c = conn.cursor()
c.execute(
    "SELECT id, role, name FROM users WHERE username = ?",
    (login_username,)
)
row = c.fetchone()
conn.close()

if row is None:
    st.error("Eroare: utilizatorul nu există în baza de date!")
    st.stop()

user_id, role, full_name = row


# ---------------------------------------------------------
# ROUTING BASED ON ROLE
# ---------------------------------------------------------
if role == "admin":
    admin.admin_main()

elif role == "manager":
    manager.manager_main(user_id)

else:
    user_page_main(user_id)
