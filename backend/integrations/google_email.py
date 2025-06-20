from mock_utils import MOCK_MODE

def send_email(to, subject, body):
    if MOCK_MODE:
        # Mocked response
        return {"status": "mocked", "message": f"Email to {to} spoofed (Google Email)"}
    # --- Real implementation below ---
    # TODO: Use Google API client to send email
    # return real_google_email_send(to, subject, body) 