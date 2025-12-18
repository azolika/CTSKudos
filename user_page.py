# ---------------------------------------------------------------
# user_page.py (refactored)
# User feedback dashboard
# All DB operations now come from db_feedback.py
# UI remains in Romanian, comments in English
# ---------------------------------------------------------------

import streamlit as st
import pandas as pd
from services.db_feedback import get_feedback_for_user


# ---------------------------------------------------------------
# MAIN USER PAGE
# ---------------------------------------------------------------
def user_page_main(current_user_id):
    st.title("Feedback-ul meu")

    # Get all feedback entries for this user
    history = get_feedback_for_user(current_user_id)

    if not history:
        st.info("Nu există feedback primit încă.")
        return

    # Convert to DataFrame
    df = pd.DataFrame(history, columns=["type", "comment", "timestamp", "manager"])

    # Count points
    red = len(df[df["type"] == "rosu"])
    black = len(df[df["type"] == "negru"])
    total = len(df)

    pct_red = round((red / total) * 100, 1) if total > 0 else 0

    calificativ = (
        "Nesatisfăcător" if pct_red < 25 else
        "Satisfăcător" if pct_red < 50 else
        "Bun"         if pct_red < 75 else
        "Excelent"
    )

    # -----------------------------------------------------------
    # SUMMARY SECTION
    # -----------------------------------------------------------
    st.header("📊 Rezultate personale")

    # Summary bar
    st.markdown(f"""
        <div style='width:100%; height:35px; display:flex; border:1px solid #777;
                    border-radius:6px; overflow:hidden; margin-bottom:10px;'>
            <div style='width:{pct_red}%; background:#d9534f;'></div>
            <div style='width:{100 - pct_red}%; background:#000;'></div>
        </div>
    """, unsafe_allow_html=True)

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("🔴 Roșu", red)
    col2.metric("⚫ Negru", black)
    col3.metric("🔢 % Roșu", f"{pct_red}%")
    col4.metric("🏅 Calificativ", calificativ)

    # -----------------------------------------------------------
    # FEEDBACK HISTORY
    # -----------------------------------------------------------
    st.markdown("### Istoric feedback")

    for point_type, comment, timestamp, manager_name in history:
        icon = "🔴" if point_type == "rosu" else "⚫"
        st.write(f"{icon} **{timestamp[:16]}** — de la *{manager_name}*")
        if comment:
            st.write(f"> {comment}")
