from backend.mock_utils import MOCK_MODE

def get_brokerage_report(agent_id):
    if MOCK_MODE:
        return {"status": "mocked", "agent_id": agent_id, "report": "Mock Broker Sumo Report"}
    # --- Real implementation below ---
    # TODO: Use Broker Sumo API
    # return real_broker_sumo_fetch_report(agent_id) 