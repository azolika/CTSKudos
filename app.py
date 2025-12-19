import streamlit as st


import streamlit_authenticator as stauth
import sqlite3
import bcrypt
# ---------------------------------------------------------
# INIT DATABASE
# ---------------------------------------------------------
from auto_init_db import auto_init_db
auto_init_db()

import admin
import manager
from user_page import user_page_main

from services.db_users import (
    get_user_id_by_username,
    create_password_reset_token,
    get_email_by_reset_token,
    update_user_password,
)
from services.emailer import send_email

st.set_page_config(
    page_title="Kudos by CargoTrack",
    page_icon="favicon.png",
    layout="centered"
)
# ---------------------------------------------------------
# APP BASE URL FOR RESET LINKS
# ---------------------------------------------------------
import os
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:9000")


def send_password_reset_email(email: str):
    """Create reset token, build link and send email."""
    token = create_password_reset_token(email)
    reset_link = f"{APP_BASE_URL}/?reset={token}"

    html = f"""
    <h2>Resetare parolă</h2>
    <p>Pentru a reseta parola contului tău, accesează link-ul de mai jos:</p>
    <p><a href="{reset_link}">{reset_link}</a></p>
    <br>
    <p>Dacă nu ai cerut resetarea parolei, poți ignora acest email.</p>
    <br>
    <p>Cu stimă,<br>
    Echipa <strong>Kudos by CargoTrack</strong></p>
    """

    send_email(
        to_email=email,
        subject="Resetare parolă - Kudos by CargoTrack",
        html_body=html,
    )


# ---------------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------------
# Page config moved to top


#----------------------------------------
# HANDLE PASSWORD RESET FLOW (?reset=TOKEN)
# ---------------------------------------------------------
params = st.query_params
if "reset" in params:
    token = params["reset"]
    email_from_token = get_email_by_reset_token(token)

    st.title("Resetare parolă")

    if not email_from_token:
        st.error("Token invalid sau expirat.")
        st.stop()

    new_pw = st.text_input("Parola nouă", type="password")
    new_pw2 = st.text_input("Confirmă parola", type="password")

    if st.button("Resetează parola"):
        if not new_pw or not new_pw2:
            st.warning("Te rugăm completează ambele câmpuri.")
        elif new_pw != new_pw2:
            st.error("Parolele nu coincid!")
        else:
            hashed = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
            # username = email in your system
            update_user_password(email_from_token.lower().strip(), hashed)
            st.success("Parola a fost resetată cu succes!")
            st.markdown("[Mergi la pagina de autentificare](.)")
            st.stop()

    # Do not continue normal app flow if we are on reset page
    st.stop()


# ---------------------------------------------------------
# LOAD USERS FOR AUTHENTICATION
# ---------------------------------------------------------
def load_users():
    """
    Returns:
        usernames: list of login usernames (emails)
        names: list of full names (display names)
        password_hashes: list of bcrypt hashes
    """
    conn = sqlite3.connect("data/feedback.db")
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
    cookie_expiry_days=1,
)

# ---------------------------------------------------------
# LOGIN FORM
# ---------------------------------------------------------
st.title("Kudos by CargoTrack")

try:
    name, auth_status, username = authenticator.login(
        location="main",
        fields={"Form name": "Autentificare"}
    )
except KeyError:
    # This happens if the cookie contains a username that is no longer in the DB
    st.error("Sesiunea ta a expirat sau este invalidă (cookie vechi).")
    st.warning("Te rugăm să ștergi cookie-urile pentru acest site și să reîncerci.")
    # Attempt to clear cookies if possible, or just stop
    try:
        authenticator.cookie_manager.delete(authenticator.cookie_name)
    except:
        pass
    st.stop()

# ---------------------------------------------------------
# FORGOTTEN PASSWORD BLOCK (ONLY WHEN NOT LOGGED IN)
# ---------------------------------------------------------
if auth_status is False or auth_status is None:

    st.markdown("---")
    st.markdown("**Ai uitat parola?**")

    email_reset = st.text_input("Introdu adresa ta de email pentru resetare:")

    if st.button("Trimite link de resetare"):
        if not email_reset.strip():
            st.warning("Te rugăm introdu adresa de email.")
        else:
            email_norm = email_reset.strip().lower()
            user_id_for_email = get_user_id_by_username(email_norm)

            if user_id_for_email is None:
                st.info("Dacă adresa există în sistem, vei primi un email cu instrucțiuni.")
            else:
                send_password_reset_email(email_norm)
                st.success("Dacă adresa există în sistem, vei primi un email cu instrucțiuni.")



# ---------------------------------------------------------
# HANDLE AUTH STATUS
# ---------------------------------------------------------
if auth_status is False:
    st.error("Nume sau parolă incorectă!")

elif auth_status is None:
    st.warning("Introduceți numele și parola.")

else:
    # -----------------------------------------------------
    # AFTER LOGIN
    # -----------------------------------------------------
    authenticator.logout("Logout", "sidebar")


    login_username = username  # username is the login email

    # -----------------------------------------------------
    # GET USER ROLE
    # -----------------------------------------------------
    conn = sqlite3.connect("data/feedback.db")
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

    # -----------------------------------------------------
    # ROUTING BASED ON ROLE
    # -----------------------------------------------------
    if role == "admin":
        admin.admin_main()
    elif role == "manager":
        manager.manager_main(user_id)
    else:
        user_page_main(user_id)
