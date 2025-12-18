import os
import smtplib
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "mail.cargotrack.ro")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "kudos@cargotrack.ro")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "Qm8z*9-MK!cra{k~@]q6UD[wu$xX7!8EBZH@UxuC_")

print(f"Testing connection to {SMTP_HOST}:{SMTP_PORT}...")
try:
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.set_debuglevel(1)
    print("EHLO...")
    server.ehlo()
    print("STARTTLS...")
    server.starttls()
    print("EHLO...")
    server.ehlo()
    print(f"Login as {SMTP_EMAIL}...")
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    print("Login successful!")
    server.quit()
except Exception as e:
    print(f"FAILED: {e}")
