# ---------------------------------------------------------------
# manager.py (refactored)
# All DB logic removed and centralized to:
#   - db_users.py
#   - db_hierarchy.py
#   - db_feedback.py
# UI remains unchanged (Romanian)
# Comments remain in English
# ---------------------------------------------------------------

import streamlit as st
import pandas as pd

from services.db_feedback import (
    add_feedback,
    get_feedback_for_user,
    get_feedback_points_for_subordinates
)
from services.db_hierarchy import get_subordinates
from services.db_users import get_user_by_id
from user_page import user_page_main
from services.db_feedback import get_user_points, get_user_calificativ

# ---------------------------------------------------------------
# HELPER: Calculate feedback summary for team
# ---------------------------------------------------------------
def calculate_team_summary(feedback_rows):
    """Calculate red/black statistics from a list of (point_type, employee_id)."""
    if not feedback_rows:
        return 0, 0, 0, "N/A"

    red = sum(1 for p, _ in feedback_rows if p == "rosu")
    black = sum(1 for p, _ in feedback_rows if p == "negru")
    total = red + black
    pct_red = round((red / total) * 100, 1) if total > 0 else 0

    calificativ = (
        "Nesatisfăcător" if pct_red < 25 else
        "Satisfăcător" if pct_red < 50 else
        "Bun" if pct_red < 75 else
        "Excelent"
    )

    return red, black, pct_red, calificativ


# ---------------------------------------------------------------
# DIALOG: CONFIRM FEEDBACK
# ---------------------------------------------------------------
@st.dialog("Confirmare Feedback")
def open_confirmation_modal(mgr_id, emp_id, p_type, comment, emp_name):
    st.write(f"Ești sigur că vrei să acorzi un **Punct {p_type.capitalize()}**?")
    st.write(f"**Către:** {emp_name}")
    st.write(f"**Mesaj:** {comment}")
    
    st.warning("Această acțiune va trimite automat un email angajatului.")
    
    col_confirm, col_cancel = st.columns(2)
    with col_confirm:
        if st.button("✅ Confirmă și Trimite", type="primary"):
            add_feedback(mgr_id, emp_id, p_type, comment)
            st.success("Feedback trimis cu succes!")
            st.rerun()
            
    with col_cancel:
        if st.button("❌ Anulează"):
            st.rerun()



# ---------------------------------------------------------------
# MAIN MANAGER PAGE
# ---------------------------------------------------------------
def manager_main(current_user_id):
    # Two tabs: as manager, and as employee
    tab1, tab2 = st.tabs(["📊 Ca Manager", "👤 Ca Angajat"])

    # ----------------------------------------------------------
    # TAB 1: MANAGER VIEW (existing logic moved here)
    # ----------------------------------------------------------
    with tab1:
        # =======================================================
        # TEAM DASHBOARD
        # =======================================================
        st.header("📊 Rezultate generale ale echipei")

        # get manager's subordinates
        subs = get_subordinates(current_user_id)
        sub_ids = [uid for uid, name, dept, functia in subs]

        if not sub_ids:
            st.info("Nu ai subordonați în sistem.")
            return

        # get all feedback for the team
        feedback_rows = get_feedback_points_for_subordinates(sub_ids)

        total_red, total_black, pct_red, calificativ = calculate_team_summary(feedback_rows)

        # Team feedback bar
        st.markdown(f"""
            <div style='width:100%; height:40px; display:flex; border:1px solid #888;
                        border-radius:6px; overflow:hidden; margin-bottom:8px;'>
                <div style='width:{pct_red}%; background:#d9534f;'></div>
                <div style='width:{100 - pct_red}%; background:#000;'></div>
            </div>
        """, unsafe_allow_html=True)

        colA, colB, colC, colD = st.columns(4)
        colA.metric("🔴 Puncte roșii", total_red)
        colB.metric("⚫ Puncte negre", total_black)
        colC.metric("🔢 % Puncte roșii", f"{pct_red}%")
        colD.metric("🏅 Calificativ", calificativ)

        # =======================================================
        # SUBORDINATE RANKING TABLE
        # =======================================================
        st.markdown("### 📋 Clasament subordonați")

        table = []
        for uid, name, dept, functia in subs:
            user_red = sum(1 for pt, emp in feedback_rows if pt == "rosu" and emp == uid)
            user_black = sum(1 for pt, emp in feedback_rows if pt == "negru" and emp == uid)
            total = user_red + user_black
            pct_r = round(user_red / total * 100, 1) if total > 0 else 0

            cal = (
                "Nesatisfăcător" if pct_r < 25 else
                "Satisfăcător" if pct_r < 50 else
                "Bun" if pct_r < 75 else
                "Excelent"
            )

            table.append([name, user_red, user_black, pct_r, cal])

        df = pd.DataFrame(table, columns=["Nume", "Roșu", "Negru", "% roșu", "Calificativ"])
        st.dataframe(df, width="stretch")

        # =======================================================
        # WELCOME MESSAGE
        # =======================================================
        user = get_user_by_id(current_user_id)
        if not user:
            st.error("Eroare: managerul nu există în baza de date!")
            return

        _, _, manager_name, _, _, _ = user
        st.subheader(f"Bun venit, {manager_name}!")

        # =======================================================
        # SELECT SUBORDINATE
        # =======================================================
        st.header("Subordonații tăi")

        subs = get_subordinates(current_user_id)
        if not subs:
            st.info("Nu ai subordonați în sistem.")
            return

        formatted = {
            f"{name} — {functia} ({dept})": uid
            for uid, name, dept, functia in subs
        }

        selected_label = st.selectbox("Alege persoana", list(formatted.keys()))
        selected_user_id = formatted[selected_label]

        # =======================================================
        # SEND FEEDBACK
        # =======================================================
        st.markdown("### Trimite feedback")

        comment = st.text_area("Comentariu (obligatoriu)")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("⚫ Punct Negru"):
                if not comment.strip():
                    st.warning("Comentariul este obligatoriu pentru punct!")
                else:
                    open_confirmation_modal(
                        current_user_id, 
                        selected_user_id, 
                        "negru", 
                        comment, 
                        selected_label
                    )

        with col2:
            if st.button("🔴 Punct Roșu"):
                if not comment.strip():
                    st.warning("Comentariul este obligatoriu pentru punct!")
                else:
                    open_confirmation_modal(
                        current_user_id, 
                        selected_user_id, 
                        "rosu", 
                        comment, 
                        selected_label
                    )

        # =======================================================
        # SELECTED USER SUMMARY
        # =======================================================
        st.header("📊 Rezultate generale pentru angajatul selectat")

        user_feedback = get_feedback_for_user(selected_user_id)
        red = len([1 for p, _, _, _ in user_feedback if p == "rosu"])
        black = len([1 for p, _, _, _ in user_feedback if p == "negru"])
        total = red + black
        pct_red = round((red / total) * 100, 1) if total > 0 else 0

        calificativ = (
            "Nesatisfăcător" if pct_red < 25 else
            "Satisfăcător" if pct_red < 50 else
            "Bun" if pct_red < 75 else
            "Excelent"
        )

        st.markdown(f"""
            <div style='width:100%; height:35px; display:flex; border-radius:6px;
                        overflow:hidden; border:1px solid #777; margin-bottom:8px;'>
                <div style='width:{pct_red}%; background-color:#d9534f;'></div>
                <div style='width:{100 - pct_red}%; background-color:#000;'></div>
            </div>
        """, unsafe_allow_html=True)

        st.write(f"🔴 **Puncte roșii:** {pct_red}%")
        st.write(f"🏅 **Calificativ:** {calificativ}")

        # =======================================================
        # FEEDBACK HISTORY (FOR SELECTED USER)
        # =======================================================
        st.markdown("---")
        st.markdown("### Istoric feedback")

        if not user_feedback:
            st.info("Nu există feedback pentru această persoană.")
        else:
            for point_type, comment, timestamp, manager_name in user_feedback:
                icon = "🔴" if point_type == "rosu" else "⚫"
                st.write(f"{icon} **{timestamp[:16]}** — de la *{manager_name}*")
                if comment:
                    st.write(f"> {comment}")

    # ----------------------------------------------------------
    # TAB 2: EMPLOYEE VIEW (own feedback, like a normal user)
    # ----------------------------------------------------------
    with tab2:
        user_page_main(current_user_id)
