"""
VAPI Tool
=========

Handles VAPI SMS/voice communications.
"""

import os
import httpx
from typing import Dict, Any
from datetime import datetime

class VAPITool:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.base_url = "https://api.vapi.ai"
        self.timeout = 30
        
    async def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """Make authenticated request to VAPI"""
        if not self.api_key:
            raise ValueError("Missing VAPI API key")
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                if method.upper() == "GET":
                    response = await client.get(f"{self.base_url}/{endpoint}", headers=headers)
                elif method.upper() == "POST":
                    response = await client.post(f"{self.base_url}/{endpoint}", headers=headers, json=data)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                    
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise Exception("VAPI API timeout")
    
    async def send_engagement_sms(self, phone: str, name: str) -> Dict[str, Any]:
        """Send engagement SMS to potential candidate"""
        try:
            message_data = {
                "phoneNumber": phone,
                "message": f"""Hi {name}! This is Impact Realty's AI recruitment system. 

We've identified you as a potential fit for exciting real estate opportunities in the Tampa Bay area.

Would you be interested in a brief 15-minute call to discuss how your background could align with our growing team?

Reply YES to schedule or STOP to opt out.

- Impact Realty Recruitment Team""",
                "from": os.getenv("VAPI_PHONE_NUMBER", "+18005551234")
            }
            
            response = await self._make_request("POST", "messages/sms", message_data)
            
            return {
                "status": "success",
                "message_id": response.get("id"),
                "sent_at": datetime.now().isoformat(),
                "phone": phone
            }
            
        except Exception as e:
            print(f"Error sending engagement SMS: {e}")
            return {"status": "error", "message": str(e)}
    
    async def initiate_voice_call(self, phone: str, name: str, script_type: str = "recruitment") -> Dict[str, Any]:
        """Initiate AI voice call for candidate engagement"""
        try:
            call_data = {
                "phoneNumber": phone,
                "assistant": {
                    "model": "gpt-3.5-turbo",
                    "voice": "jennifer",
                    "firstMessage": f"Hi {name}, this is Sarah from Impact Realty's recruitment team. Do you have a few minutes to discuss an exciting real estate opportunity?",
                    "systemMessage": self._get_system_message(script_type, name),
                    "maxDurationSeconds": 600,  # 10 minutes max
                    "backgroundSound": "office"
                },
                "phoneNumberId": os.getenv("VAPI_PHONE_NUMBER_ID")
            }
            
            response = await self._make_request("POST", "calls", call_data)
            
            return {
                "status": "success",
                "call_id": response.get("id"),
                "started_at": datetime.now().isoformat(),
                "phone": phone,
                "estimated_duration": "5-10 minutes"
            }
            
        except Exception as e:
            print(f"Error initiating voice call: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Get status of an ongoing or completed call"""
        try:
            response = await self._make_request("GET", f"calls/{call_id}")
            
            return {
                "call_id": call_id,
                "status": response.get("status"),
                "duration_seconds": response.get("durationSeconds"),
                "cost": response.get("cost"),
                "recording_url": response.get("recordingUrl"),
                "transcript": response.get("transcript"),
                "summary": response.get("summary"),
                "ended_reason": response.get("endedReason")
            }
            
        except Exception as e:
            print(f"Error getting call status: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_sms_response(self, phone: str) -> Dict[str, Any]:
        """Check for SMS responses from candidate"""
        try:
            response = await self._make_request("GET", f"messages/sms?phone={phone}&limit=10")
            
            messages = response.get("messages", [])
            recent_responses = []
            
            for message in messages:
                if message.get("direction") == "inbound":
                    recent_responses.append({
                        "id": message.get("id"),
                        "content": message.get("message"),
                        "received_at": message.get("createdAt"),
                        "from": message.get("from")
                    })
            
            return {
                "status": "success", 
                "responses": recent_responses
            }
            
        except Exception as e:
            print(f"Error getting SMS responses: {e}")
            return {"status": "error", "message": str(e)}
    
    def _get_system_message(self, script_type: str, name: str) -> str:
        """Get appropriate system message for different call types"""
        if script_type == "recruitment":
            return f"""You are Sarah, a friendly AI recruiter from Impact Realty in Tampa Bay, Florida. 

You're calling {name} about potential real estate opportunities. Your goals:
1. Gauge their interest in real estate career opportunities
2. Qualify their current license status and experience
3. If interested, schedule them for a follow-up call with our human recruitment team
4. Keep the call conversational and under 10 minutes

Key talking points:
- Impact Realty is a growing, innovative brokerage in Tampa Bay
- We offer competitive commission splits and modern tools
- We're looking for both experienced agents and new licensees
- We provide comprehensive training and support

If they express interest, get their email and preferred callback times.
If they're not interested, thank them politely and end the call.
Be natural, friendly, and professional. Don't oversell - focus on fit and mutual interest."""

        elif script_type == "follow_up":
            return f"""You are Sarah from Impact Realty following up with {name} about their interest in our real estate opportunities.

This is a follow-up call to:
1. Answer any questions they might have
2. Provide more details about our opportunities
3. Confirm their continued interest
4. Schedule next steps if appropriate

Be warm and professional. Reference that this is a follow-up to previous contact."""
        
        else:
            return f"""You are Sarah, a professional representative from Impact Realty calling {name}. Be helpful, courteous, and professional.""" 