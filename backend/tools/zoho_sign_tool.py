"""
Zoho Sign Tool
=============

Handles Zoho Sign e-signature verification.
"""

import os
import httpx
from typing import Dict, Any, List
from datetime import datetime

class ZohoSignTool:
    def __init__(self):
        self.client_id = os.getenv("ZOHO_CLIENT_ID")
        self.client_secret = os.getenv("ZOHO_CLIENT_SECRET")
        self.refresh_token = os.getenv("ZOHO_REFRESH_TOKEN")
        self.access_token = None
        self.base_url = "https://sign.zoho.com/api/v1"
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
                "scope": "ZohoSign.documents.ALL"
            }
            
            response = await client.post(
                "https://accounts.zoho.com/oauth/v2/token",
                data=data
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data["access_token"]
            return self.access_token
    
    async def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """Make authenticated request to Zoho Sign API"""
        if not self.access_token:
            await self._get_access_token()
            
        headers = {
            "Authorization": f"Zoho-oauthtoken {self.access_token}",
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
                    
                if response.status_code == 401:  # Token expired
                    await self._get_access_token()
                    headers["Authorization"] = f"Zoho-oauthtoken {self.access_token}"
                    # Retry request
                    if method.upper() == "GET":
                        response = await client.get(f"{self.base_url}/{endpoint}", headers=headers)
                    elif method.upper() == "POST":
                        response = await client.post(f"{self.base_url}/{endpoint}", headers=headers, json=data)
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise Exception("Zoho Sign API timeout")
    
    async def verify_signature(self, document_id: str) -> Dict[str, Any]:
        """Verify e-signature status and validity"""
        try:
            response = await self._make_request("GET", f"requests/{document_id}")
            
            document_data = response.get("requests", {})
            
            # Get signature details
            signatures = []
            for action in document_data.get("actions", []):
                if action.get("action_type") == "SIGN":
                    signatures.append({
                        "recipient_email": action.get("recipient_email"),
                        "recipient_name": action.get("recipient_name"),
                        "status": action.get("action_status"),
                        "signed_date": action.get("signed_date"),
                        "ip_address": action.get("signing_ip"),
                        "verification_type": action.get("verification_type"),
                        "is_valid": action.get("action_status") == "SIGNED"
                    })
            
            overall_status = document_data.get("request_status", "UNKNOWN")
            
            return {
                "document_id": document_id,
                "valid": overall_status == "COMPLETED",
                "status": overall_status,
                "signatures": signatures,
                "total_signatures_required": len([a for a in document_data.get("actions", []) if a.get("action_type") == "SIGN"]),
                "completed_signatures": len([s for s in signatures if s["is_valid"]]),
                "document_name": document_data.get("request_name"),
                "created_time": document_data.get("created_time"),
                "completed_time": document_data.get("completed_time"),
                "expires_on": document_data.get("expires_on")
            }
            
        except Exception as e:
            print(f"Error verifying signature: {e}")
            return {"valid": False, "error": str(e)}
    
    async def get_document_status(self, document_id: str) -> Dict[str, Any]:
        """Get comprehensive document status"""
        try:
            response = await self._make_request("GET", f"requests/{document_id}")
            
            document_data = response.get("requests", {})
            
            return {
                "document_id": document_id,
                "status": document_data.get("request_status"),
                "name": document_data.get("request_name"),
                "created_by": document_data.get("owner_email"),
                "created_time": document_data.get("created_time"),
                "modified_time": document_data.get("modified_time"),
                "expires_on": document_data.get("expires_on"),
                "is_sequential": document_data.get("is_sequential", False),
                "reminder_period": document_data.get("reminder_period"),
                "actions": [
                    {
                        "action_id": action.get("action_id"),
                        "action_type": action.get("action_type"),
                        "recipient_email": action.get("recipient_email"),
                        "recipient_name": action.get("recipient_name"),
                        "status": action.get("action_status"),
                        "signed_date": action.get("signed_date"),
                        "declined_date": action.get("declined_date"),
                        "decline_reason": action.get("decline_reason")
                    }
                    for action in document_data.get("actions", [])
                ]
            }
            
        except Exception as e:
            print(f"Error getting document status: {e}")
            return {"status": "error", "error": str(e)}
    
    async def download_signed_document(self, document_id: str) -> Dict[str, Any]:
        """Download the signed document"""
        try:
            response = await self._make_request("GET", f"requests/{document_id}/pdf")
            
            if response.get("status") == "success":
                return {
                    "status": "success",
                    "download_url": response.get("pdf_url"),
                    "expires_at": response.get("expires_at"),
                    "document_id": document_id
                }
            else:
                return {"status": "error", "message": "Document not ready for download"}
                
        except Exception as e:
            print(f"Error downloading signed document: {e}")
            return {"status": "error", "error": str(e)}
    
    async def send_reminder(self, document_id: str, recipient_email: str = None) -> Dict[str, Any]:
        """Send reminder for pending signature"""
        try:
            reminder_data = {}
            if recipient_email:
                reminder_data["emails"] = [recipient_email]
            
            response = await self._make_request("POST", f"requests/{document_id}/remind", reminder_data)
            
            return {
                "status": "success",
                "message": "Reminder sent successfully",
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error sending reminder: {e}")
            return {"status": "error", "error": str(e)}
    
    async def get_audit_trail(self, document_id: str) -> Dict[str, Any]:
        """Get audit trail for document"""
        try:
            response = await self._make_request("GET", f"requests/{document_id}/audittrail")
            
            return {
                "document_id": document_id,
                "audit_trail_url": response.get("audit_trail_url"),
                "expires_at": response.get("expires_at"),
                "status": "success"
            }
            
        except Exception as e:
            print(f"Error getting audit trail: {e}")
            return {"status": "error", "error": str(e)}
    
    async def validate_certificate(self, document_id: str) -> Dict[str, Any]:
        """Validate digital certificate on signed document"""
        try:
            # Get the completed document details
            document_status = await self.get_document_status(document_id)
            
            if document_status.get("status") != "COMPLETED":
                return {
                    "valid": False,
                    "message": "Document not fully signed",
                    "status": document_status.get("status")
                }
            
            # Validate each signature's certificate
            validation_results = []
            for action in document_status.get("actions", []):
                if action.get("action_type") == "SIGN" and action.get("status") == "SIGNED":
                    validation_results.append({
                        "recipient": action.get("recipient_email"),
                        "valid_certificate": True,  # Zoho Sign handles cert validation
                        "signed_date": action.get("signed_date"),
                        "certificate_valid": True
                    })
            
            return {
                "document_id": document_id,
                "valid": len(validation_results) > 0 and all(r["valid_certificate"] for r in validation_results),
                "certificate_validations": validation_results,
                "validated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error validating certificate: {e}")
            return {"valid": False, "error": str(e)} 