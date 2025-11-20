import streamlit as st
import sqlite3
import pandas as pd

def get_feedback_for_user(user_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        SELECT f.point_type, f.comment, f.timestamp, m.name
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        WHERE f.employee_id = ?
        ORDER BY timestamp DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return rows


def user_page_main(current_user_id):
    st.title("Feedback-ul meu")

    # Lekérjük az összes feedbacket
    history = get_feedback_for_user(current_user_id)

    if not history:
        st.info("Nu există feedback primit încă.")
        return

    # Összesítés
    df = pd.DataFrame(history, columns=["type", "comment", "timestamp", "manager"])
    red = len(df[df["type"] == "rosu"])
    black = len(df[df["type"] == "negru"])
    total = len(df)

    pct_red = round((red / total) * 100, 1) if total > 0 else 0

    calificativ = (
        "Nesatisfăcător" if pct_red < 25 else
        "Satisfăcător" if pct_red < 50 else
        "Bun" if pct_red < 75 else
        "Excelent"
    )

    st.header("📊 Rezultate personale")

    # BAR
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

    st.markdown("### Istoric feedback")
    for row in history:
        point_type, comment, timestamp, manager_name = row
        icon = "🔴" if point_type == "rosu" else "⚫"
        st.write(f"{icon} **{timestamp[:16]}** — de la *{manager_name}*")
        if comment:
            st.write(f"> {comment}")
