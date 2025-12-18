import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST", "mail.cargotrack.ro")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "kudos@cargotrack.ro")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "Qm8z*9-MK!cra{k~@]q6UD[wu$xX7!8EBZH@UxuC_")
FROM_EMAIL = os.getenv("FROM_EMAIL", "kudos@cargotrack.ro")
SEND_EMAILS = os.getenv("SEND_EMAILS", "true").lower() == "true"


def send_email(to_email: str, subject: str, html_body: str):
    if not SEND_EMAILS:
        print(f"[EMAIL DISABLED] Email to {to_email} NOT sent (test mode).")
        return True
    msg = EmailMessage()
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content("HTML email fallback")
    msg.add_alternative(html_body, subtype="html")

    try:
        print(f"Connecting to SMTP {SMTP_HOST}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.ehlo()

        print(f"Logging in as {SMTP_EMAIL}...")
        server.login(SMTP_EMAIL, SMTP_PASSWORD)

        print("Sending email...")
        server.send_message(msg)
        server.quit()

        print("Email sent successfully!")
        return True

    except Exception as e:
        print("SMTP ERROR:", repr(e))
        return False
