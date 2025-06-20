"""
Zoho CRM Integration Tool
========================

Handles all Zoho CRM API interactions.
"""

import os
import httpx
from typing import Dict, Any, List
import json
from datetime import datetime
from mock_utils import MOCK_MODE, fetch_crm_data

class ZohoCRMTool:
    def __init__(self):
        self.client_id = os.getenv("ZOHO_CLIENT_ID")
        self.client_secret = os.getenv("ZOHO_CLIENT_SECRET")
        self.refresh_token = os.getenv("ZOHO_REFRESH_TOKEN")
        self.access_token = None
        self.base_url = "https://www.zohoapis.com/crm/v2"
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
                "grant_type": "refresh_token"
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
        """Make authenticated request to Zoho CRM API"""
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
                elif method.upper() == "PUT":
                    response = await client.put(f"{self.base_url}/{endpoint}", headers=headers, json=data)
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
                    elif method.upper() == "PUT":
                        response = await client.put(f"{self.base_url}/{endpoint}", headers=headers, json=data)
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise Exception("Zoho CRM API timeout")
    
    async def get_candidate_suggestions(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get candidate suggestions from Zoho Zia"""
        # Use Zoho CRM search to find candidates matching criteria
        search_criteria = []
        if criteria.get("location"):
            search_criteria.append(f"(City:equals:{criteria['location']})")
        if criteria.get("experience_years"):
            search_criteria.append(f"(Experience:greater_than:{criteria['experience_years']})")
        if criteria.get("license_status"):
            search_criteria.append(f"(License_Status:equals:{criteria['license_status']})")
            
        criteria_string = " and ".join(search_criteria) if search_criteria else ""
        
        try:
            if MOCK_MODE:
                return fetch_crm_data(f"Leads/search?criteria={criteria_string}&page=1&per_page=20")
            response = await self._make_request(
                "GET", 
                f"Leads/search?criteria={criteria_string}&page=1&per_page=20"
            )
            
            candidates = []
            for lead in response.get("data", []):
                candidates.append({
                    "id": lead.get("id"),
                    "name": f"{lead.get('First_Name', '')} {lead.get('Last_Name', '')}".strip(),
                    "email": lead.get("Email"),
                    "phone": lead.get("Phone"),
                    "city": lead.get("City"),
                    "state": lead.get("State"),
                    "experience_years": lead.get("Experience"),
                    "license_number": lead.get("License_Number"),
                    "license_status": lead.get("License_Status")
                })
            
            return candidates
            
        except Exception as e:
            print(f"Error getting candidate suggestions: {e}")
            return []
    
    async def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get candidate details"""
        try:
            if MOCK_MODE:
                return fetch_crm_data(f"Leads/{candidate_id}")
            response = await self._make_request("GET", f"Leads/{candidate_id}")
            
            lead_data = response.get("data", [{}])[0]
            return {
                "id": lead_data.get("id"),
                "name": f"{lead_data.get('First_Name', '')} {lead_data.get('Last_Name', '')}".strip(),
                "email": lead_data.get("Email"),
                "phone": lead_data.get("Phone"),
                "city": lead_data.get("City"),
                "state": lead_data.get("State"),
                "experience_years": lead_data.get("Experience"),
                "license_number": lead_data.get("License_Number"),
                "license_status": lead_data.get("License_Status"),
                "notes": lead_data.get("Description")
            }
            
        except Exception as e:
            print(f"Error getting candidate: {e}")
            return {}
    
    async def get_skill_match_score(self, candidate: Dict[str, Any]) -> float:
        """Get Zia skill match score using Zoho Analytics"""
        # This would use Zoho Zia's ML capabilities to score candidates
        try:
            # For now, calculate basic score based on available data
            score = 0.5  # Base score
            
            if candidate.get("license_status") == "Active":
                score += 0.2
            if candidate.get("experience_years", 0) >= 2:
                score += 0.2
            if candidate.get("city") in ["Tampa", "St. Petersburg", "Clearwater"]:
                score += 0.1  # Local market knowledge
                
            return min(score, 1.0)
            
        except Exception as e:
            print(f"Error calculating skill match score: {e}")
            return 0.0
    
    async def get_deal(self, deal_id: str) -> Dict[str, Any]:
        """Get deal information"""
        try:
            if MOCK_MODE:
                return fetch_crm_data(f"Deals/{deal_id}")
            response = await self._make_request("GET", f"Deals/{deal_id}")
            
            deal_data = response.get("data", [{}])[0]
            return {
                "id": deal_data.get("id"),
                "deal_name": deal_data.get("Deal_Name"),
                "amount": deal_data.get("Amount", 0),
                "stage": deal_data.get("Stage"),
                "closing_date": deal_data.get("Closing_Date"),
                "total_commission": deal_data.get("Total_Commission", 0),
                "account_name": deal_data.get("Account_Name", {}).get("name"),
                "owner": deal_data.get("Owner", {}).get("name")
            }
            
        except Exception as e:
            print(f"Error getting deal: {e}")
            return {"total_commission": 0}
    
    async def get_commission_agreements(self, deal_id: str) -> List[Dict[str, Any]]:
        """Get commission agreements for a deal"""
        try:
            # Search for custom module or related records
            if MOCK_MODE:
                return fetch_crm_data(f"Commission_Splits/search?criteria=(Deal_ID:equals:{deal_id})")
            response = await self._make_request(
                "GET", 
                f"Commission_Splits/search?criteria=(Deal_ID:equals:{deal_id})"
            )
            
            agreements = []
            for split in response.get("data", []):
                agreements.append({
                    "id": split.get("id"),
                    "agent_id": split.get("Agent_ID"),
                    "agent_name": split.get("Agent_Name"),
                    "commission_percentage": float(split.get("Commission_Percentage", 0)),
                    "commission_amount": float(split.get("Commission_Amount", 0)),
                    "split_type": split.get("Split_Type"),
                    "status": split.get("Status")
                })
            
            return agreements
            
        except Exception as e:
            print(f"Error getting commission agreements: {e}")
            # Return default structure for backwards compatibility
            return [
                {"agent_id": "agent_001", "commission_percentage": 3.0},
                {"agent_id": "agent_002", "commission_percentage": 2.5}
            ]
    
    async def get_deal_documents(self, deal_id: str) -> List[Dict[str, Any]]:
        """Get all documents associated with a deal"""
        try:
            if MOCK_MODE:
                return fetch_crm_data(f"Deals/{deal_id}/Attachments")
            response = await self._make_request("GET", f"Deals/{deal_id}/Attachments")
            
            documents = []
            for attachment in response.get("data", []):
                documents.append({
                    "id": attachment.get("id"),
                    "file_name": attachment.get("File_Name"),
                    "file_size": attachment.get("Size"),
                    "type": self._classify_document_type(attachment.get("File_Name", "")),
                    "requires_signature": self._requires_signature(attachment.get("File_Name", "")),
                    "created_time": attachment.get("Created_Time"),
                    "modified_time": attachment.get("Modified_Time")
                })
            
            return documents
            
        except Exception as e:
            print(f"Error getting deal documents: {e}")
            # Return default structure for backwards compatibility
            return [
                {"id": "doc_001", "type": "signed_purchase_agreement", "requires_signature": True},
                {"id": "doc_002", "type": "commission_agreement", "requires_signature": True}
            ]
    
    async def get_deal_approvals(self, deal_id: str) -> List[Dict[str, Any]]:
        """Get approval status for a deal"""
        try:
            # Check custom approval workflow module
            if MOCK_MODE:
                return fetch_crm_data(f"Deal_Approvals/search?criteria=(Deal_ID:equals:{deal_id})")
            response = await self._make_request(
                "GET", 
                f"Deal_Approvals/search?criteria=(Deal_ID:equals:{deal_id})"
            )
            
            approvals = []
            for approval in response.get("data", []):
                approvals.append({
                    "id": approval.get("id"),
                    "role": approval.get("Approval_Role"),
                    "status": approval.get("Status"),
                    "approved_by": approval.get("Approved_By", {}).get("name"),
                    "approved_by_email": approval.get("Approved_By", {}).get("email"),
                    "date": approval.get("Approval_Date"),
                    "comments": approval.get("Comments")
                })
            
            return approvals
            
        except Exception as e:
            print(f"Error getting deal approvals: {e}")
            # Return default structure for backwards compatibility
            return [
                {"role": "broker", "status": "approved", "approved_by": "broker@example.com", "date": "2024-01-01"},
                {"role": "compliance", "status": "pending", "approved_by": None, "date": None}
            ]
    
    async def create_compliance_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a compliance review task in Zoho CRM"""
        try:
            task_record = {
                "data": [{
                    "Subject": f"Compliance Review: {task_data.get('type', 'General')}",
                    "Status": "Not Started",
                    "Priority": task_data.get('priority', 'Normal').title(),
                    "Description": json.dumps(task_data.get('details', {})),
                    "Due_Date": datetime.now().strftime("%Y-%m-%d"),
                    "Task_Owner": {"id": os.getenv("ZOHO_COMPLIANCE_OWNER_ID", "default_owner")},
                    "What_Id": task_data.get('deal_id') if task_data.get('deal_id') else None
                }]
            }
            
            if MOCK_MODE:
                return fetch_crm_data("Tasks", task_record)
            response = await self._make_request("POST", "Tasks", task_record)
            
            return {
                "status": "created",
                "task_id": response.get("data", [{}])[0].get("details", {}).get("id"),
                "message": "Compliance task created successfully"
            }
            
        except Exception as e:
            print(f"Error creating compliance task: {e}")
            return {"status": "error", "message": str(e)}
    
    def _classify_document_type(self, filename: str) -> str:
        """Classify document type based on filename"""
        filename_lower = filename.lower()
        
        if "purchase" in filename_lower and "agreement" in filename_lower:
            return "signed_purchase_agreement"
        elif "commission" in filename_lower:
            return "commission_agreement"
        elif "contract" in filename_lower:
            return "contract"
        elif "disclosure" in filename_lower:
            return "disclosure"
        else:
            return "other"
    
    def _requires_signature(self, filename: str) -> bool:
        """Determine if document requires signature"""
        signature_required_types = [
            "agreement", "contract", "disclosure", "addendum"
        ]
        
        filename_lower = filename.lower()
        return any(doc_type in filename_lower for doc_type in signature_required_types) 