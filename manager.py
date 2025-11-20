import streamlit as st
import sqlite3
from datetime import datetime
import pandas as pd

# --- Calculate summary ---
def calculate_feedback_summary(feedback_rows):
    if not feedback_rows:
        return 0, 0, 0, "N/A"

    df = pd.DataFrame(feedback_rows, columns=["point_type", "comment", "timestamp"])

    total = len(df)
    red = len(df[df["point_type"] == "rosu"])
    black = len(df[df["point_type"] == "negru"])

    pct_black = round((black / total) * 100, 1) if total > 0 else 0

    if pct_black < 25:
        calificativ = "Nesatisfăcător"
    elif pct_black < 50:
        calificativ = "Satisfăcător"
    elif pct_black < 75:
        calificativ = "Bun"
    else:
        calificativ = "Excelent"

    return red, black, pct_black, calificativ


def render_feedback_bar(red, black):
    total = red + black
    if total == 0:
        st.info("Nu există feedback încă.")
        return

    pct_red = (red / total) * 100
    pct_black = (black / total) * 100

    st.markdown(f"""
        <div style='width:100%; height:30px; display:flex; border-radius:6px; overflow:hidden; border:1px solid #999;'>
            <div style='width:{pct_red}%; background-color:#d9534f;'></div>
            <div style='width:{pct_black}%; background-color:#000;'></div>
        </div>
    """, unsafe_allow_html=True)

# ---------------- DB HELPERS ----------------

def get_user_id(name):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE name = ?", (name,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None


def get_subordinates(manager_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        SELECT u.id, u.name, u.departament, u.functia
        FROM hierarchy h
        JOIN users u ON h.user_id = u.id
        WHERE h.manager_id = ?
        ORDER BY u.name
    """, (manager_id,))
    rows = c.fetchall()
    conn.close()
    return rows


def add_feedback(manager_id, employee_id, point_type, comment):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO feedback(manager_id, employee_id, point_type, comment, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (manager_id, employee_id, point_type, comment, datetime.now().isoformat()))
    conn.commit()
    conn.close()


def get_feedback_for_user(user_id):
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("""
        SELECT point_type, comment, timestamp, m.name
        FROM feedback f
        JOIN users m ON f.manager_id = m.id
        WHERE f.employee_id = ?
        ORDER BY timestamp DESC
    """, (user_id,))
    rows = c.fetchall()
    conn.close()
    return rows

# ---------------- MANAGER UI ----------------

def manager_main(current_user_id):

    # --- MINI DASHBOARD (Team Summary) ---
    st.header("📊 Rezultate generale ale echipei")

    # Lekérjük a manager összes beosztottját
    subs = get_subordinates(current_user_id)
    sub_ids = [uid for uid, name, dept, functia in subs]

    if not sub_ids:
        st.info("Nu ai subordonați în sistem.")
        return

    # Lekérjük az összes pontot, amit a csapat kapott
    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    q_marks = ",".join(["?"] * len(sub_ids))  # dinamikus IN lista
    c.execute(f"SELECT point_type, employee_id FROM feedback WHERE employee_id IN ({q_marks})", sub_ids)
    rows = c.fetchall()
    conn.close()

    # összesített mutatók
    total_red = sum(1 for r in rows if r[0] == "rosu")
    total_black = sum(1 for r in rows if r[0] == "negru")
    total = total_red + total_black
    pct_red = round(total_red / total * 100, 1) if total > 0 else 0

    calificativ = (
        "Nesatisfăcător" if pct_red < 25 else
        "Satisfăcător" if pct_red < 50 else
        "Bun" if pct_red < 75 else
        "Excelent"
    )

    # BAR – echipa
    st.markdown(f"""
        <div style='width:100%; height:40px; display:flex; border:1px solid #888; border-radius:6px; overflow:hidden; margin-bottom:8px;'>
            <div style='width:{pct_red}%; background:#d9534f;'></div>
            <div style='width:{100 - pct_red}%; background:#000;'></div>
        </div>
    """, unsafe_allow_html=True)

    colA, colB, colC, colD = st.columns(4)
    colA.metric("🔴 Puncte roșii", total_red)
    colB.metric("⚫ Puncte negre", total_black)
    colC.metric("🔢 % Puncte roșii", f"{pct_red}%")
    colD.metric("🏅 Calificativ", calificativ)

    st.markdown("### 📋 Clasament subordonați")
    import pandas as pd

    # Rangsor építése
    table = []
    for uid, name, dept, functia in subs:
        user_red = sum(1 for p in rows if p[0] == "rosu" and p[1] == uid)
        user_black = sum(1 for p in rows if p[0] == "negru" and p[1] == uid)
        user_total = user_red + user_black
        pct_r = round(user_red / user_total * 100, 1) if user_total > 0 else 0
        cal = (
            "Nesatisfăcător" if pct_r < 25 else
            "Satisfăcător" if pct_r < 50 else
            "Bun" if pct_r < 75 else
            "Excelent"
        )
        table.append([name, user_red, user_black, pct_r, cal])

    df = pd.DataFrame(table, columns=["Nume", "Roșu", "Negru", "% roșu", "Calificativ"])
    st.dataframe(df, use_container_width=True)


    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT name FROM users WHERE id = ?", (current_user_id,))
    row = c.fetchone()
    conn.close()

    if not row:
        st.error("Eroare: managerul nu există în baza de date!")
        return

    current_user_name = row[0]
    st.subheader(f"Bun venit, {current_user_name}!")

    # ---------- Subordonați ----------
    st.header("Subordonații tăi")
    subs = get_subordinates(current_user_id)

    if not subs:
        st.info("Nu ai subordonați în sistem.")
        return

    sub_dict = {f"{name} — {functia} ({dept})": uid for uid, name, dept, functia in subs}
    selection = st.selectbox("Alege persoana", list(sub_dict.keys()))
    selected_user_id = sub_dict[selection]

    # ---------- Trimite feedback ----------
    st.markdown("### Trimite feedback")

    comment = st.text_area("Comentariu (obligatoriu)")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("⚫ Punct Negru"):
            if not comment.strip():
                st.warning("Comentariul este obligatoriu pentru punct!")
            else:
                add_feedback(current_user_id, selected_user_id, "negru", comment)
                st.success("Feedback trimis!")

    with col2:
        if st.button("🔴 Punct Roșu"):
            if not comment.strip():
                st.warning("Comentariul este obligatoriu pentru punct!")
            else:
                add_feedback(current_user_id, selected_user_id, "rosu", comment)
                st.success("Feedback trimis!")

    # --- SUMMARY SECTION ---
    # --- SUMMARY SECTION ---
    st.header("📊 Rezultate generale pentru angajatul selectat")

    conn = sqlite3.connect("feedback.db")
    c = conn.cursor()
    c.execute("SELECT point_type FROM feedback WHERE employee_id = ?", (selected_user_id,))
    pts = [r[0] for r in c.fetchall()]
    conn.close()

    red = pts.count("rosu")
    black = pts.count("negru")
    total = red + black

    pct_red = round((red / total) * 100, 1) if total > 0 else 0

    calificativ = (
        "Nesatisfăcător" if pct_red < 25 else
        "Satisfăcător" if pct_red < 50 else
        "Bun" if pct_red < 75 else
        "Excelent"
    )

    # BAR
    st.markdown(f"""
        <div style='width:100%; height:35px; display:flex; border-radius:6px; overflow:hidden; border:1px solid #777; margin-bottom:8px;'>
            <div style='width:{pct_red}%; background-color:#d9534f;'></div>
            <div style='width:{100 - pct_red}%; background-color:#000;'></div>
        </div>
    """, unsafe_allow_html=True)

    st.write(f"🔴 **Puncte roșii:** {pct_red}%")
    st.write(f"🏅 **Calificativ:** {calificativ}")

    # ---------- Istoric feedback ----------
    st.markdown("---")
    st.markdown("### Istoric feedback")

    history = get_feedback_for_user(selected_user_id)

    if not history:
        st.info("Nu există feedback pentru această persoană.")
    else:
        for point_type, comment, timestamp, manager_name in history:
            color = "⚫" if point_type == "negru" else ("🔴" if point_type == "rosu" else "💬")
            st.write(f"{color} **{timestamp[:16]}** — de la *{manager_name}*")
            if comment:
                st.write(f"> {comment}")
