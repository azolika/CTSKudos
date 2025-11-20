# ---------------------- admin.py (normalized & fixed) ----------------------
import streamlit as st
import sqlite3
import bcrypt
import json
import pandas as pd
from st_aggrid import (
    GridOptionsBuilder,
    AgGrid,
    GridUpdateMode,
    DataReturnMode,
)

# ---------------------------------------------------------------
# Load departments
# ---------------------------------------------------------------
try:
    with open("config.json", "r", encoding="utf-8") as f:
        CONFIG = json.load(f)
    DEPARTMENTS_CONFIG = CONFIG.get("departments", {})
    DEPARTMENTS = list(DEPARTMENTS_CONFIG.keys())
except Exception:
    CONFIG = {}
    DEPARTMENTS_CONFIG = {}
    DEPARTMENTS = []


# ---------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------
def get_all_users():
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute(
        """
        SELECT id, username, name, role, departament, functia
        FROM users
        ORDER BY name ASC
    """
    )
    rows = c.fetchall()
    conn.close()
    return rows


def get_manager_for_user(user_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute(
        """
        SELECT m.id, m.name
        FROM hierarchy h
        JOIN users m ON h.manager_id = m.id
        WHERE h.user_id = ?
    """,
        (user_id,),
    )
    row = c.fetchone()
    conn.close()
    return row


def get_user_id_by_username(username):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None


def add_user(username, name, password_hash, departament, functia, role):
    username = username.lower().strip()
    departament = (departament or "").strip()
    functia = (functia or "").strip()

    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO users(username, name, role, password_hash, departament, functia)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (username, name, role, password_hash, departament, functia),
    )
    conn.commit()
    conn.close()


def update_user(user_id, name, role, departament, functia):
    departament = (departament or "").strip()
    functia = (functia or "").strip()

    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute(
        """
        UPDATE users
        SET name = ?, role = ?, departament = ?, functia = ?
        WHERE id = ?
    """,
        (name, role, departament, functia, user_id),
    )
    conn.commit()
    conn.close()


def delete_user(user_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("DELETE FROM hierarchy WHERE user_id = ? OR manager_id = ?", (user_id, user_id))
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


def assign_manager(user_id, manager_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("INSERT INTO hierarchy(user_id, manager_id) VALUES (?, ?)", (user_id, manager_id))
    conn.commit()
    conn.close()


def set_manager_for_user(user_id, manager_id):
    """Set or clear a user's manager in the hierarchy table."""
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()

    # töröljük az összes régi manager bejegyzést erre a userre
    c.execute("DELETE FROM hierarchy WHERE user_id = ?", (user_id,))

    # ha van új manager, beszúrjuk
    if manager_id is not None:
        c.execute(
            "INSERT INTO hierarchy(user_id, manager_id) VALUES (?, ?)",
            (user_id, manager_id),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------------------
# Admin Home
# ---------------------------------------------------------------
def admin_home():
    st.title("Panou Administrativ")
    st.write("Administrează utilizatorii și ierarhiile.")


# ---------------------------------------------------------------
# Admin Users Page
# ---------------------------------------------------------------
def admin_users():
    st.title("Gestionare Utilizatori")

    # -------- Lista utilizatori (GRID) --------
    users = get_all_users()
    df = pd.DataFrame(
        users,
        columns=["id", "username", "name", "role", "departament", "functia"],
    )

    gb = GridOptionsBuilder.from_dataframe(df)
    gb.configure_selection("single", use_checkbox=True)
    gb.configure_pagination(True)
    gb.configure_side_bar()
    grid = AgGrid(
        df,
        gridOptions=gb.build(),
        update_mode=GridUpdateMode.SELECTION_CHANGED,
        data_return_mode=DataReturnMode.FILTERED_AND_SORTED,
        fit_columns_on_grid_load=True,
        height=300,
    )

    # --- Kiválasztott user stabil kiolvasása ---
    selected_rows = grid.get("selected_rows")
    if selected_rows is None:
        selected_rows = []
    elif isinstance(selected_rows, pd.DataFrame):
        selected_rows = selected_rows.to_dict("records")

    selected_user = selected_rows[0] if selected_rows else None

    # -------- Új user hozzáadása --------
    st.markdown("---")
    st.subheader("Adaugă Utilizator Nou")

    col1, col2 = st.columns(2)
    with col1:
        new_username = st.text_input("Username")
        new_name = st.text_input("Nume complet")
        new_password = st.text_input("Parola", type="password")

    with col2:
        departament = st.selectbox("Departament", DEPARTMENTS)
        functii = DEPARTMENTS_CONFIG.get(departament, [])
        if functii:
            functia = st.selectbox("Funcția", functii)
        else:
            functia = st.text_input("Funcția (manual)")

        role = st.selectbox("Rol", ["manager", "user"])

    st.markdown("### Selectează Manager (opțional)")
    all_users = get_all_users()
    manager_map = {u[2]: u[0] for u in all_users}  # name -> id
    manager_list = ["(fără manager)"] + list(manager_map.keys())
    chosen_manager = st.selectbox("Manager (nou)", manager_list)

    if st.button("Adaugă Utilizator"):
        if not new_username or not new_name or not new_password:
            st.warning("Completează toate câmpurile obligatorii.")
        else:
            pw_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
            add_user(new_username, new_name, pw_hash, departament, functia, role)
            new_id = get_user_id_by_username(new_username)
            if chosen_manager != "(fără manager)":
                set_manager_for_user(new_id, manager_map[chosen_manager])
            st.success("Utilizator adăugat!")
            st.rerun()

    # -------- Edit / Delete --------
    st.markdown("---")
    st.subheader("Editează / Șterge Utilizator")

    if not selected_user:
        st.info("Selectează un utilizator din tabel.")
        return

    # Normalizáljuk a kulcsokat, hogy biztosan egyezzenek
    su = {k.lower(): v for k, v in selected_user.items()}
    selected_id = su.get("id")
    selected_username = su.get("username")
    selected_name = su.get("name")
    selected_role = su.get("role")

    # NORMALIZÁLT departament & functia
    selected_dept = (su.get("departament") or "").strip()
    selected_func = (su.get("functia") or "").strip()

    # Aktuális manager kiolvasása
    manager_info = get_manager_for_user(selected_id)
    current_manager_name = manager_info[1] if manager_info else "(fără manager)"

    st.write(f"**Utilizator selectat:** `{selected_username}` — {selected_name}")
    st.write(f"Manager curent: **{current_manager_name}**")

    col3, col4 = st.columns(2)
    with col3:
        edit_name = st.text_input("Nume complet (edit)", selected_name)
        edit_role = st.selectbox(
            "Rol (edit)",
            ["manager", "user"],
            index=0 if selected_role == "manager" else 1,
        )

    with col4:
        # Departamente normalizálva (strip)
        dept_options = [d.strip() for d in DEPARTMENTS]

        # ha a DB-ben lévő érték nincs a configban, tegyük be az elejére
        if selected_dept and selected_dept not in dept_options:
            dept_options.insert(0, selected_dept)

        edit_dept = st.selectbox(
            "Departament (edit)",
            dept_options,
            index=dept_options.index(selected_dept) if selected_dept in dept_options else 0,
        )

        # Funcții normalizálva
        functii_edit = [f.strip() for f in DEPARTMENTS_CONFIG.get(edit_dept, [])]

        if functii_edit:
            if selected_func in functii_edit:
                edit_func = st.selectbox(
                    "Funcția (edit)",
                    functii_edit,
                    index=functii_edit.index(selected_func),
                )
            else:
                # ha a DB-s functia nincs a listában, tegyük be elsőnek
                if selected_func:
                    functii_edit.insert(0, selected_func)
                edit_func = st.selectbox("Funcția (edit)", functii_edit, index=0)
        else:
            edit_func = st.text_input("Funcția (edit)", selected_func)

    # --- Manager szerkesztés ---
    st.markdown("### Manager (editare)")

    manager_list_edit = ["(fără manager)"] + list(manager_map.keys())
    if current_manager_name in manager_map:
        default_index = manager_list_edit.index(current_manager_name)
    else:
        default_index = 0

    edit_manager_name = st.selectbox(
        "Manager (edit)",
        manager_list_edit,
        index=default_index,
    )

    # Gombok: mentés / törlés
    col_save, col_delete = st.columns(2)

    with col_save:
        if st.button("Salvează Modificările"):
            # user adatok frissítése
            update_user(selected_id, edit_name, edit_role, edit_dept, edit_func)

            # manager frissítése
            if edit_manager_name == "(fără manager)":
                set_manager_for_user(selected_id, None)
            else:
                set_manager_for_user(selected_id, manager_map[edit_manager_name])

            st.success("Modificări salvate!")
            st.rerun()

    with col_delete:
        if st.button("Șterge Utilizatorul"):
            delete_user(selected_id)
            st.warning(f"Utilizatorul '{selected_username}' a fost șters.")
            st.rerun()


# ---------------------------------------------------------------
# Main Admin Router
# ---------------------------------------------------------------
def admin_main():
    st.sidebar.title("Meniu Administrator")
    page = st.sidebar.selectbox("Navigare", ["Acasă", "Utilizatori"])

    if page == "Acasă":
        admin_home()
    elif page == "Utilizatori":
        admin_users()
