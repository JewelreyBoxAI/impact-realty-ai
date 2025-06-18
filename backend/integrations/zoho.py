from backend.mock_utils import MOCK_MODE

def fetch_crm_contacts():
    if MOCK_MODE:
        return [{"id": "mock-zoho-1", "name": "Mock Zoho Contact"}]
    # --- Real implementation below ---
    # TODO: Use Zoho CRM API
    # return real_zoho_crm_fetch_contacts()

def send_zoho_email(to, subject, body):
    if MOCK_MODE:
        return {"status": "mocked", "message": f"Email to {to} spoofed (Zoho)"}
    # --- Real implementation below ---
    # TODO: Use Zoho Mail API
    # return real_zoho_mail_send(to, subject, body) 