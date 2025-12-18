from services.emailer import send_email
from dotenv import load_dotenv
import os

# Try loading env to mimic "correct" setup, or comment out to test defaults
# load_dotenv() 

print("Attempting to send email via services.emailer...")
success = send_email(
    to_email="kudos@cargotrack.ro", # Sending to self to be safe
    subject="Test Email from Debugger",
    html_body="<h1>It works?</h1>"
)

if success:
    print("SUCCESS: Email sent.")
else:
    print("FAILURE: Email not sent.")
