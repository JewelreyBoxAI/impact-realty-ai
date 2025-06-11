"""
Broker Sumo Integration Tool
===========================

Handles Broker Sumo API for deal disbursement data.
"""

import os
import httpx
from typing import Dict, Any, List
from datetime import datetime

class BrokerSumoTool:
    def __init__(self):
        self.api_key = os.getenv("BROKER_SUMO_API_KEY")
        self.base_url = os.getenv("BROKER_SUMO_BASE_URL", "https://api.brokersumo.com/v1")
        self.timeout = 30
        
    async def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """Make authenticated request to Broker Sumo API"""
        if not self.api_key:
            raise ValueError("Missing Broker Sumo API key")
            
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
                raise Exception("Broker Sumo API timeout")
    
    async def get_commission_data(self, deal_id: str) -> Dict[str, Any]:
        """Get commission data and splits from Broker Sumo"""
        try:
            response = await self._make_request("GET", f"deals/{deal_id}/commissions")
            
            commission_data = response.get("data", {})
            
            return {
                "deal_id": deal_id,
                "total_commission": commission_data.get("total_commission", 0),
                "gross_commission": commission_data.get("gross_commission", 0),
                "net_commission": commission_data.get("net_commission", 0),
                "splits": [
                    {
                        "agent_id": split.get("agent_id"),
                        "agent_name": split.get("agent_name"),
                        "split_percentage": float(split.get("split_percentage", 0)),
                        "split_amount": float(split.get("split_amount", 0)),
                        "role": split.get("role", "agent"),
                        "is_primary": split.get("is_primary", False)
                    }
                    for split in commission_data.get("splits", [])
                ],
                "fees": [
                    {
                        "fee_type": fee.get("type"),
                        "amount": float(fee.get("amount", 0)),
                        "description": fee.get("description", "")
                    }
                    for fee in commission_data.get("fees", [])
                ],
                "disbursement_status": commission_data.get("disbursement_status", "pending"),
                "last_updated": commission_data.get("last_updated")
            }
            
        except Exception as e:
            print(f"Error getting commission data: {e}")
            return {"splits": [], "error": str(e)}
    
    async def get_disbursement_status(self, deal_id: str) -> Dict[str, Any]:
        """Get disbursement readiness status"""
        try:
            response = await self._make_request("GET", f"deals/{deal_id}/disbursement")
            
            disbursement_data = response.get("data", {})
            
            return {
                "deal_id": deal_id,
                "status": disbursement_data.get("status", "unknown"),
                "readiness_score": disbursement_data.get("readiness_score", 0),
                "required_documents": disbursement_data.get("required_documents", []),
                "missing_documents": disbursement_data.get("missing_documents", []),
                "pending_approvals": disbursement_data.get("pending_approvals", []),
                "estimated_disbursement_date": disbursement_data.get("estimated_disbursement_date"),
                "blocking_issues": disbursement_data.get("blocking_issues", []),
                "checklist": [
                    {
                        "item": item.get("name"),
                        "status": item.get("status"),
                        "required": item.get("required", False),
                        "completed_date": item.get("completed_date")
                    }
                    for item in disbursement_data.get("checklist", [])
                ]
            }
            
        except Exception as e:
            print(f"Error getting disbursement status: {e}")
            return {"status": "error", "error": str(e)}
    
    async def create_disbursement_request(self, deal_id: str, disbursement_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a disbursement request"""
        try:
            request_data = {
                "deal_id": deal_id,
                "commission_splits": disbursement_data.get("splits", []),
                "total_amount": disbursement_data.get("total_amount", 0),
                "requested_by": disbursement_data.get("requested_by"),
                "notes": disbursement_data.get("notes", ""),
                "priority": disbursement_data.get("priority", "normal")
            }
            
            response = await self._make_request("POST", "disbursements", request_data)
            
            return {
                "status": "success",
                "disbursement_id": response.get("data", {}).get("id"),
                "request_number": response.get("data", {}).get("request_number"),
                "created_at": datetime.now().isoformat(),
                "estimated_processing_time": response.get("data", {}).get("estimated_processing_time")
            }
            
        except Exception as e:
            print(f"Error creating disbursement request: {e}")
            return {"status": "error", "error": str(e)}
    
    async def get_deal_financials(self, deal_id: str) -> Dict[str, Any]:
        """Get comprehensive financial data for a deal"""
        try:
            response = await self._make_request("GET", f"deals/{deal_id}/financials")
            
            financial_data = response.get("data", {})
            
            return {
                "deal_id": deal_id,
                "sale_price": float(financial_data.get("sale_price", 0)),
                "gross_commission": float(financial_data.get("gross_commission", 0)),
                "commission_rate": float(financial_data.get("commission_rate", 0)),
                "listing_side_commission": float(financial_data.get("listing_side_commission", 0)),
                "selling_side_commission": float(financial_data.get("selling_side_commission", 0)),
                "brokerage_fees": [
                    {
                        "type": fee.get("type"),
                        "amount": float(fee.get("amount", 0)),
                        "percentage": float(fee.get("percentage", 0))
                    }
                    for fee in financial_data.get("brokerage_fees", [])
                ],
                "third_party_fees": [
                    {
                        "vendor": fee.get("vendor"),
                        "type": fee.get("type"),
                        "amount": float(fee.get("amount", 0))
                    }
                    for fee in financial_data.get("third_party_fees", [])
                ],
                "net_to_agents": float(financial_data.get("net_to_agents", 0)),
                "calculated_at": financial_data.get("calculated_at")
            }
            
        except Exception as e:
            print(f"Error getting deal financials: {e}")
            return {"error": str(e)}
    
    async def validate_commission_split(self, deal_id: str, proposed_splits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate proposed commission splits against deal data"""
        try:
            validation_data = {
                "deal_id": deal_id,
                "proposed_splits": proposed_splits
            }
            
            response = await self._make_request("POST", f"deals/{deal_id}/validate-splits", validation_data)
            
            validation_result = response.get("data", {})
            
            return {
                "is_valid": validation_result.get("is_valid", False),
                "total_percentage": validation_result.get("total_percentage", 0),
                "total_amount": validation_result.get("total_amount", 0),
                "errors": validation_result.get("errors", []),
                "warnings": validation_result.get("warnings", []),
                "corrected_splits": validation_result.get("corrected_splits", [])
            }
            
        except Exception as e:
            print(f"Error validating commission split: {e}")
            return {"is_valid": False, "errors": [str(e)]}
    
    async def get_agent_performance(self, agent_id: str, date_range: Dict[str, str] = None) -> Dict[str, Any]:
        """Get agent performance metrics"""
        try:
            endpoint = f"agents/{agent_id}/performance"
            if date_range:
                start_date = date_range.get("start_date")
                end_date = date_range.get("end_date")
                endpoint += f"?start_date={start_date}&end_date={end_date}"
            
            response = await self._make_request("GET", endpoint)
            
            performance_data = response.get("data", {})
            
            return {
                "agent_id": agent_id,
                "total_deals": performance_data.get("total_deals", 0),
                "total_commission": float(performance_data.get("total_commission", 0)),
                "average_commission_per_deal": float(performance_data.get("average_commission_per_deal", 0)),
                "total_volume": float(performance_data.get("total_volume", 0)),
                "deals_by_month": performance_data.get("deals_by_month", []),
                "top_performing_price_range": performance_data.get("top_performing_price_range"),
                "average_days_to_close": performance_data.get("average_days_to_close", 0),
                "client_satisfaction_score": performance_data.get("client_satisfaction_score", 0)
            }
            
        except Exception as e:
            print(f"Error getting agent performance: {e}")
            return {"error": str(e)} 