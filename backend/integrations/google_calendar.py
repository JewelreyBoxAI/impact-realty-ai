from mock_utils import MOCK_MODE

def create_event(event_data):
    if MOCK_MODE:
        return {"status": "mocked", "event_id": "mock-event-123", "details": event_data}
    # --- Real implementation below ---
    # TODO: Use Google Calendar API to create event
    # return real_google_calendar_create(event_data)

def get_events(user_id):
    if MOCK_MODE:
        return [{"event_id": "mock-event-123", "summary": "Mock Meeting", "user_id": user_id}]
    # --- Real implementation below ---
    # TODO: Use Google Calendar API to fetch events
    # return real_google_calendar_fetch(user_id) 