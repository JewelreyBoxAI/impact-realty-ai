"""
Zoho Mail Tool
=============

Handles Zoho Mail API interactions.
"""

import os
import httpx
from typing import Dict, Any, List
from datetime import datetime

class ZohoMailTool:
    def __init__(self):
        self.client_id = os.getenv("ZOHO_CLIENT_ID")
        self.client_secret = os.getenv("ZOHO_CLIENT_SECRET")
        self.refresh_token = os.getenv("ZOHO_REFRESH_TOKEN")
        self.access_token = None
        self.base_url = "https://mail.zoho.com/api"
        self.timeout = 30
        
    async def _get_access_token(self) -> str:
        """Get fresh access token using refresh token"""
        if not all([self.client_id, self.client_secret, self.refresh_token]):
            raise ValueError("Missing Zoho credentials")
            
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            data = {
                "refresh_token": self.refresh_token,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "refresh_token",
                "scope": "ZohoMail.messages.ALL,ZohoMail.accounts.READ"
            }
            
            response = await client.post(
                "https://accounts.zoho.com/oauth/v2/token",
                data=data
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data["access_token"]
            return self.access_token
    
    async def _make_request(self, method: str, endpoint: str, data: Dict = None, account_id: str = None) -> Dict[str, Any]:
        """Make authenticated request to Zoho Mail API"""
        if not self.access_token:
            await self._get_access_token()
            
        headers = {
            "Authorization": f"Zoho-oauthtoken {self.access_token}",
            "Content-Type": "application/json"
        }
        
        # Use default account if not specified
        if not account_id:
            account_id = os.getenv("ZOHO_MAIL_ACCOUNT_ID", "default")
            
        full_url = f"{self.base_url}/accounts/{account_id}/{endpoint}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                if method.upper() == "GET":
                    response = await client.get(full_url, headers=headers)
                elif method.upper() == "POST":
                    response = await client.post(full_url, headers=headers, json=data)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                    
                if response.status_code == 401:  # Token expired
                    await self._get_access_token()
                    headers["Authorization"] = f"Zoho-oauthtoken {self.access_token}"
                    # Retry request
                    if method.upper() == "GET":
                        response = await client.get(full_url, headers=headers)
                    elif method.upper() == "POST":
                        response = await client.post(full_url, headers=headers, json=data)
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise Exception("Zoho Mail API timeout")
    
    async def send_engagement_email(self, email: str, name: str, meeting_link: str) -> Dict[str, Any]:
        """Send engagement email to potential candidate"""
        try:
            email_data = {
                "fromAddress": os.getenv("ZOHO_MAIL_FROM_ADDRESS", "recruiting@impactrealty.com"),
                "toAddress": email,
                "subject": f"Exciting Real Estate Opportunity - {name}",
                "content": f"""
Dear {name},

I hope this email finds you well. We've identified you as a potential candidate for an exciting opportunity with Impact Realty.

We'd love to discuss how your background and experience could be a great fit for our growing team. 

I've prepared a brief meeting slot for us to connect: {meeting_link}

During our conversation, we'll cover:
- Current opportunities in the Tampa Bay market
- Our competitive commission structure
- Support and training programs
- Growth opportunities within our organization

Looking forward to speaking with you soon!

Best regards,
Impact Realty Recruitment Team

---
This is an automated message from our AI recruitment system.
                """.strip(),
                "mailFormat": "html"
            }
            
            response = await self._make_request("POST", "messages", email_data)
            
            return {
                "status": "success",
                "message_id": response.get("data", {}).get("messageId"),
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error sending engagement email: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_recent_emails(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent emails for processing"""
        try:
            response = await self._make_request(
                "GET", 
                f"messages/view?start=0&limit={limit}&folder=INBOX"
            )
            
            emails = []
            for message in response.get("data", []):
                emails.append({
                    "id": message.get("messageId"),
                    "subject": message.get("subject"),
                    "sender": message.get("fromAddress"),
                    "sender_name": message.get("sender"),
                    "received_time": message.get("receivedTime"),
                    "priority": self._determine_priority(message),
                    "category": self._categorize_email(message),
                    "summary": message.get("summary", ""),
                    "content_preview": message.get("content", "")[:200] + "..." if len(message.get("content", "")) > 200 else message.get("content", "")
                })
            
            return emails
            
        except Exception as e:
            print(f"Error getting recent emails: {e}")
            return [
                {"id": "email_001", "subject": "Urgent: Closing scheduled", "sender": "broker@example.com"},
                {"id": "email_002", "subject": "Property inquiry - Tampa", "sender": "client@example.com"}
            ]
    
    async def get_email_content(self, message_id: str) -> Dict[str, Any]:
        """Get full email content by message ID"""
        try:
            response = await self._make_request("GET", f"messages/{message_id}")
            
            message_data = response.get("data", {})
            return {
                "id": message_data.get("messageId"),
                "subject": message_data.get("subject"),
                "sender": message_data.get("fromAddress"),
                "sender_name": message_data.get("sender"),
                "content": message_data.get("content"),
                "attachments": message_data.get("attachments", []),
                "received_time": message_data.get("receivedTime"),
                "priority": self._determine_priority(message_data),
                "category": self._categorize_email(message_data)
            }
            
        except Exception as e:
            print(f"Error getting email content: {e}")
            return {}
    
    async def send_reply(self, original_message_id: str, reply_content: str) -> Dict[str, Any]:
        """Send reply to an email"""
        try:
            # First get the original message to get reply context
            original = await self.get_email_content(original_message_id)
            
            reply_data = {
                "fromAddress": os.getenv("ZOHO_MAIL_FROM_ADDRESS", "kevin@impactrealty.com"),
                "toAddress": original.get("sender"),
                "subject": f"Re: {original.get('subject', '')}",
                "content": reply_content,
                "mailFormat": "html",
                "inReplyTo": original_message_id
            }
            
            response = await self._make_request("POST", "messages", reply_data)
            
            return {
                "status": "success",
                "message_id": response.get("data", {}).get("messageId"),
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error sending reply: {e}")
            return {"status": "error", "message": str(e)}
    
    def _determine_priority(self, message: Dict[str, Any]) -> str:
        """Determine email priority based on content and sender"""
        subject = (message.get("subject", "")).lower()
        sender = (message.get("fromAddress", "")).lower()
        content = (message.get("content", "") or message.get("summary", "")).lower()
        
        # High priority indicators
        high_priority_keywords = [
            "urgent", "asap", "emergency", "closing", "deadline", 
            "contract", "offer", "counteroffer", "inspection"
        ]
        
        # VIP sender domains/addresses
        vip_domains = ["broker", "attorney", "lender", "title"]
        
        if any(keyword in subject or keyword in content for keyword in high_priority_keywords):
            return "high"
        elif any(domain in sender for domain in vip_domains):
            return "high"
        elif "meeting" in subject or "schedule" in subject:
            return "medium"
        else:
            return "normal"
    
    def _categorize_email(self, message: Dict[str, Any]) -> str:
        """Categorize email based on content"""
        subject = (message.get("subject", "")).lower()
        content = (message.get("content", "") or message.get("summary", "")).lower()
        
        if any(word in subject or word in content for word in ["meeting", "schedule", "calendar", "appointment"]):
            return "scheduling"
        elif any(word in subject or word in content for word in ["compliance", "document", "signature", "contract"]):
            return "compliance"
        elif any(word in subject or word in content for word in ["property", "listing", "showing", "mls"]):
            return "real_estate"
        elif any(word in subject or word in content for word in ["commission", "closing", "disbursement"]):
            return "financial"
        else:
            return "general" 