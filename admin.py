# ---------------------------------------------------------------
# admin.py (refactored)
# Admin UI for user and hierarchy management
# All DB operations routed to:
#   - db_users.py
#   - db_hierarchy.py
# UI remains Romanian
# Comments in English
# ---------------------------------------------------------------

import streamlit as st
import bcrypt
import json
import pandas as pd
from st_aggrid import (
    GridOptionsBuilder,
    AgGrid,
    GridUpdateMode,
    DataReturnMode,
)

from services.db_feedback import get_user_points, get_user_calificativ
# Import refactored DB modules
from services.db_users import (
    get_all_users,
    add_user,
    update_user,
    delete_user,
    get_user_id_by_username,
)
from services.db_hierarchy import (
    set_manager_for_user,
    get_manager_for_user,
)
from services.db_feedback import get_last_feedback

# ---------------------------------------------------------------
# Load departments config
# ---------------------------------------------------------------
try:
    with open("config.json", "r", encoding="utf-8") as f:
        CONFIG = json.load(f)
    DEPARTMENTS_CONFIG = CONFIG.get("departments", {})
    DEPARTMENTS = sorted(DEPARTMENTS_CONFIG.keys())
except Exception:
    CONFIG = {}
    DEPARTMENTS_CONFIG = {}
    DEPARTMENTS = []


# ---------------------------------------------------------------
# Admin Home Page
# ---------------------------------------------------------------
def admin_home():
    st.title("Panou Administrativ — Statistici")

    import sqlite3
    from datetime import datetime, timedelta

    conn = sqlite3.connect("data/feedback.db")
    c = conn.cursor()

    # ---------------------------------------------------------
    # 1) Total feedback-uri în sistem
    # ---------------------------------------------------------
    c.execute("SELECT COUNT(*) FROM feedback")
    total_feedback = c.fetchone()[0]

    # ---------------------------------------------------------
    # 2) Feedback-uri în ultimele 30 zile (roșu / negru)
    # ---------------------------------------------------------
    cutoff = (datetime.now() - timedelta(days=30)).isoformat()
    c.execute("""
        SELECT point_type, COUNT(*)
        FROM feedback
        WHERE timestamp >= ?
        GROUP BY point_type
    """, (cutoff,))
    rows = c.fetchall()

    red_30 = 0
    black_30 = 0
    for pt, cnt in rows:
        if pt == "rosu":
            red_30 = cnt
        elif pt == "negru":
            black_30 = cnt

    # ---------------------------------------------------------
    # 3) Top 5 manageri după activitate
    # ---------------------------------------------------------
    c.execute("""
        SELECT m.name, COUNT(*)
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        GROUP BY m.id
        ORDER BY COUNT(*) DESC
        LIMIT 5
    """)
    top_managers = c.fetchall()

    conn.close()

    # ---------------------------------------------------------
    # UI — stat boxes
    # ---------------------------------------------------------
    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Total feedback-uri în sistem", total_feedback)

    with col2:
        st.metric("Roșii (30 zile)", red_30)

    with col3:
        st.metric("Negre (30 zile)", black_30)

    st.markdown("---")
    st.subheader("Top 5 manageri după activitate")

    if top_managers:
        for name, count in top_managers:
            st.write(f"**{name}** — {count} feedback-uri")
    else:
        st.info("Nu există feedback-uri în sistem.")

    st.markdown("---")


# ---------------------------------------------------------------
# Admin Users Page
# ---------------------------------------------------------------
def admin_users():
    st.title("Gestionare Utilizatori")


    # -----------------------------------------------------------
    # USER TABLE
    # -----------------------------------------------------------
    # build enriched user list
    users = get_all_users()
    enriched = []
    for (uid, username, name, role, dept, functia, superior) in users:
        red, black = get_user_points(uid)
        total = red + black
        calificativ = get_user_calificativ(uid)

        enriched.append([
            uid,
            username,
            name,
            total,
            calificativ,
            dept,
            functia,
            superior or ""
        ])

    # new dataframe structure
    df = pd.DataFrame(
        enriched,
        columns=["id", "username", "name", "Puncte totale", "Calificativ", "departament", "functia", "Superior"]
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

    # Get selected user reliably
    selected_rows = grid.get("selected_rows")
    if selected_rows is None:
        selected_rows = []
    elif isinstance(selected_rows, pd.DataFrame):
        selected_rows = selected_rows.to_dict("records")

    selected_user = selected_rows[0] if selected_rows else None

    # -----------------------------------------------------------
    # ADD NEW USER
    # -----------------------------------------------------------
    st.markdown("---")
    st.subheader("Adaugă Utilizator Nou")

    col1, col2 = st.columns(2)
    with col1:
        new_username = st.text_input("Username")
        new_name = st.text_input("Nume complet")
        new_password = st.text_input("Parola", type="password")

    with col2:
        departament = st.selectbox("Departament", DEPARTMENTS)
        functii = sorted(DEPARTMENTS_CONFIG.get(departament, []))
        if functii:
            functia = st.selectbox("Funcția", functii)
        else:
            functia = st.text_input("Funcția (manual)")

        role = st.selectbox("Rol", ["manager", "user"])

    # Manager selection
    st.markdown("### Selectează Manager (opțional)")
    all_users = get_all_users()
    manager_map = {u[2]: u[0] for u in all_users}   # name -> id
    manager_list = ["(fără manager)"] + list(manager_map.keys())

    chosen_manager = st.selectbox("Manager (nou)", manager_list)

    # Submit new user
    if st.button("Adaugă Utilizator"):
        if not new_username or not new_name or not new_password:
            st.warning("Completează toate câmpurile obligatorii.")
        else:
            pw_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
            add_user(new_username, new_name, pw_hash, departament, functia, role)

            new_id = get_user_id_by_username(new_username)

            # Assign manager if selected
            if chosen_manager != "(fără manager)":
                set_manager_for_user(new_id, manager_map[chosen_manager])

            st.success("Utilizator adăugat!")
            st.rerun()

    # -----------------------------------------------------------
    # EDIT / DELETE USER
    # -----------------------------------------------------------
    st.markdown("---")
    st.subheader("Editează / Șterge Utilizator")

    if not selected_user:
        st.info("Selectează un utilizator din tabel.")
        return

    su = {k.lower(): v for k, v in selected_user.items()}

    selected_id = su.get("id")
    selected_username = su.get("username")
    selected_name = su.get("name")
    selected_role = su.get("role")
    selected_dept = (su.get("departament") or "").strip()
    selected_func = (su.get("functia") or "").strip()

    # Current manager
    manager_info = get_manager_for_user(selected_id)
    current_manager_name = manager_info[1] if manager_info else "(fără manager)"

    st.write(f"**Utilizator selectat:** `{selected_username}` — {selected_name}")
    st.write(f"Manager curent: **{current_manager_name}**")

    # Edit form
    col3, col4 = st.columns(2)
    with col3:
        edit_name = st.text_input("Nume complet (edit)", selected_name)
        edit_role = st.selectbox(
            "Rol (edit)",
            ["manager", "user"],
            index=0 if selected_role == "manager" else 1,
        )

    with col4:
        # Department options
        dept_options = [d.strip() for d in DEPARTMENTS]

        if selected_dept and selected_dept not in dept_options:
            dept_options.insert(0, selected_dept)

        edit_dept = st.selectbox(
            "Departament (edit)",
            dept_options,
            index=dept_options.index(selected_dept) if selected_dept in dept_options else 0,
        )

        functii_edit = sorted([f.strip() for f in DEPARTMENTS_CONFIG.get(edit_dept, [])])
        if functii_edit:
            if selected_func in functii_edit:
                edit_func = st.selectbox(
                    "Funcția (edit)",
                    functii_edit,
                    index=functii_edit.index(selected_func),
                )
            else:
                if selected_func:
                    functii_edit.insert(0, selected_func)
                edit_func = st.selectbox("Funcția (edit)", functii_edit, index=0)
        else:
            edit_func = st.text_input("Funcția (edit)", selected_func)

    # Manager edit
    st.markdown("### Manager (editare)")

    manager_list_edit = ["(fără manager)"] + list(manager_map.keys())
    default_index = (
        manager_list_edit.index(current_manager_name)
        if current_manager_name in manager_map else
        0
    )

    edit_manager_name = st.selectbox(
        "Manager (edit)",
        manager_list_edit,
        index=default_index,
    )

    # Action buttons
    col_save, col_delete = st.columns(2)

    # Save changes
    with col_save:
        if st.button("Salvează Modificările"):
            update_user(selected_id, edit_name, edit_role, edit_dept, edit_func)

            if edit_manager_name == "(fără manager)":
                set_manager_for_user(selected_id, None)
            else:
                set_manager_for_user(selected_id, manager_map[edit_manager_name])

            st.success("Modificări salvate!")
            st.rerun()

    # Delete user
    with col_delete:
        if st.button("Șterge Utilizatorul"):
            delete_user(selected_id)
            st.warning(f"Utilizatorul '{selected_username}' a fost șters.")
            st.rerun()


# ---------------------------------------------------------------
# MAIN ADMIN ROUTER
# ---------------------------------------------------------------
def admin_main():
    st.sidebar.title("Meniu Administrator")
    page = st.sidebar.selectbox("Navigare", ["Acasă", "Utilizatori"])

    if page == "Acasă":
        admin_home()
    elif page == "Utilizatori":
        admin_users()
