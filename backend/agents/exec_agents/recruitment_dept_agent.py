"""
Recruitment Department Agent - Consolidated
==========================================

Handles the entire recruiting pipeline in one agent:
- Sourcing (Zoho Zia + custom scraping)
- Qualification (license verification + skill matching)
- Engagement (calendar + email/SMS)
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
from tools.zoho_crm_tool import ZohoCRMTool
from tools.license_verification_tool import LicenseVerificationTool
from tools.zoho_calendar_tool import ZohoCalendarTool
from tools.zoho_mail_tool import ZohoMailTool
from tools.vapi_tool import VAPITool
from memory.vector_memory_manager import VectorMemoryManager

logger = logging.getLogger(__name__)

class RecruitmentDeptAgent:
    """
    Consolidated Recruitment Department Agent (Eileen's Supervisor)
    """
    
    def __init__(self):
        # Tool integrations
        self.zoho_crm = ZohoCRMTool()
        self.license_tool = LicenseVerificationTool()
        self.calendar_tool = ZohoCalendarTool()
        self.mail_tool = ZohoMailTool()
        self.vapi_tool = VAPITool()
        self.memory_manager = VectorMemoryManager()
        
        # Configuration-driven approach
        self.config = {
            "sourcing": {
                "default_criteria": {
                    "target_count": 10,
                    "limit": 50,
                    "experience_min_years": 2,
                    "license_required": True
                },
                "search_sources": ["zoho_zia", "linkedin", "indeed", "realtor_com"],
                "geo_targets": ["Tampa", "St_Petersburg", "Clearwater", "Brandon"]
            },
            "qualification": {
                "min_score_threshold": 0.7,
                "scoring_weights": {
                    "zia_match": 0.6,
                    "license_valid": 0.3,
                    "experience": 0.1
                },
                "required_licenses": ["FL_REAL_ESTATE", "FL_BROKER"]
            },
            "engagement": {
                "templates": {
                    "initial_contact": "Hi {name}, I'd love to discuss an exciting opportunity at Impact Realty. Are you available for a brief call this week?",
                    "follow_up": "Following up on our conversation about the opportunity at Impact Realty. When would be a good time to chat?",
                    "meeting_scheduled": "Great! I've scheduled our call for {time}. Looking forward to speaking with you."
                },
                "communication_preferences": ["email", "sms", "phone"],
                "follow_up_schedule": [1, 3, 7]  # days
            }
        }
        
        # Metrics tracking
        self.metrics = {
            "candidates_sourced": 0,
            "candidates_qualified": 0,
            "candidates_engaged": 0,
            "response_rate": 0.0,
            "conversion_rate": 0.0
        }
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process recruitment requests"""
        action = request.get("action")
        
        if action == "source_candidates":
            return await self._source_candidates(request.get("criteria", {}))
        elif action == "qualify_candidate":
            return await self._qualify_candidate(request.get("candidate_id"))
        elif action == "engage_candidate":
            return await self._engage_candidate(request.get("candidate_id"))
        elif action == "run_full_pipeline":
            return await self._run_full_pipeline(request.get("criteria", {}))
        else:
            return {"error": "Unknown recruitment action", "status": "failed"}
    
    async def _source_candidates(self, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Source candidates using multiple channels"""
        try:
            # Merge with default criteria
            search_criteria = {**self.config["sourcing"]["default_criteria"], **criteria}
            
            logger.info(f"Starting candidate sourcing with criteria: {search_criteria}")
            
            # Primary: Zoho Zia candidate suggestions
            zia_candidates = await self.zoho_crm.get_candidate_suggestions(search_criteria)
            
            # Fallback: Custom sourcing if Zia results are insufficient
            all_candidates = zia_candidates
            if len(zia_candidates) < search_criteria["target_count"]:
                custom_candidates = await self._custom_sourcing(search_criteria)
                all_candidates.extend(custom_candidates)
            
            # Store in vector memory
            await self.memory_manager.store_candidates(all_candidates)
            
            # Update metrics
            self.metrics["candidates_sourced"] += len(all_candidates)
            
            return {
                "status": "success",
                "candidates_found": len(all_candidates),
                "sources_used": ["zoho_zia"] + (["custom"] if len(zia_candidates) < search_criteria["target_count"] else []),
                "candidates": all_candidates[:search_criteria["limit"]]
            }
            
        except Exception as e:
            logger.error(f"Sourcing error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _qualify_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Qualify candidate through comprehensive scoring"""
        try:
            # Get candidate data
            candidate = await self.zoho_crm.get_candidate(candidate_id)
            
            # Multi-factor qualification
            qualification_results = {}
            
            # 1. Zoho Zia skill matching
            zia_score = await self.zoho_crm.get_skill_match_score(candidate)
            qualification_results["zia_score"] = zia_score
            
            # 2. License verification
            license_status = await self.license_tool.verify_license(
                candidate.get("license_number"),
                candidate.get("state", "FL")
            )
            qualification_results["license_status"] = license_status
            
            # 3. Calculate composite score
            final_score = self._calculate_composite_score(zia_score, license_status, candidate)
            qualification_results["final_score"] = final_score
            qualification_results["qualified"] = final_score >= self.config["qualification"]["min_score_threshold"]
            
            # Store qualification results
            await self.memory_manager.store_qualification({
                "candidate_id": candidate_id,
                **qualification_results,
                "timestamp": datetime.now().isoformat()
            })
            
            # Update metrics
            if qualification_results["qualified"]:
                self.metrics["candidates_qualified"] += 1
            
            return {
                "status": "success",
                "candidate_id": candidate_id,
                "qualification": qualification_results
            }
            
        except Exception as e:
            logger.error(f"Qualification error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _engage_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Engage qualified candidate with multi-channel approach"""
        try:
            # Get candidate info
            candidate = await self.zoho_crm.get_candidate(candidate_id)
            
            engagement_results = {
                "candidate_id": candidate_id,
                "engagement_attempts": [],
                "successful_contacts": []
            }
            
            # Primary: Email + Calendar scheduling
            if candidate.get("email"):
                email_result = await self._attempt_email_engagement(candidate)
                engagement_results["engagement_attempts"].append(email_result)
                
                if email_result["status"] == "success":
                    engagement_results["successful_contacts"].append("email")
            
            # Fallback: SMS via VAPI
            if candidate.get("phone") and not engagement_results["successful_contacts"]:
                sms_result = await self._attempt_sms_engagement(candidate)
                engagement_results["engagement_attempts"].append(sms_result)
                
                if sms_result["status"] == "success":
                    engagement_results["successful_contacts"].append("sms")
            
            # Update metrics
            if engagement_results["successful_contacts"]:
                self.metrics["candidates_engaged"] += 1
            
            return {
                "status": "success",
                "engagement": engagement_results,
                "next_steps": self._determine_next_steps(engagement_results)
            }
            
        except Exception as e:
            logger.error(f"Engagement error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _run_full_pipeline(self, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Run complete recruitment pipeline"""
        pipeline_results = {
            "sourcing": None,
            "qualified_candidates": [],
            "engaged_candidates": [],
            "pipeline_summary": {}
        }
        
        try:
            # Step 1: Source candidates
            sourcing_result = await self._source_candidates(criteria)
            pipeline_results["sourcing"] = sourcing_result
            
            if sourcing_result["status"] != "success":
                return pipeline_results
            
            # Step 2: Qualify all candidates
            for candidate in sourcing_result["candidates"]:
                qualification_result = await self._qualify_candidate(candidate.get("id"))
                if qualification_result.get("qualification", {}).get("qualified", False):
                    pipeline_results["qualified_candidates"].append(qualification_result)
            
            # Step 3: Engage qualified candidates
            for qualified in pipeline_results["qualified_candidates"]:
                engagement_result = await self._engage_candidate(qualified["candidate_id"])
                if engagement_result["status"] == "success":
                    pipeline_results["engaged_candidates"].append(engagement_result)
            
            # Pipeline summary
            pipeline_results["pipeline_summary"] = {
                "total_sourced": len(sourcing_result["candidates"]),
                "total_qualified": len(pipeline_results["qualified_candidates"]),
                "total_engaged": len(pipeline_results["engaged_candidates"]),
                "qualification_rate": len(pipeline_results["qualified_candidates"]) / len(sourcing_result["candidates"]) if sourcing_result["candidates"] else 0,
                "engagement_rate": len(pipeline_results["engaged_candidates"]) / len(pipeline_results["qualified_candidates"]) if pipeline_results["qualified_candidates"] else 0
            }
            
            return {"status": "success", "pipeline": pipeline_results}
            
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return {"status": "error", "message": str(e)}
    
    # Helper methods
    async def _custom_sourcing(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Custom sourcing when Zoho Zia coverage is insufficient"""
        # Placeholder for LinkedIn/job board scraping
        return [
            {"id": "custom_001", "name": "John Doe", "source": "linkedin"},
            {"id": "custom_002", "name": "Jane Smith", "source": "indeed"}
        ]
    
    def _calculate_composite_score(self, zia_score: float, license_status: Dict, candidate: Dict) -> float:
        """Calculate weighted composite qualification score"""
        weights = self.config["qualification"]["scoring_weights"]
        
        base_score = zia_score * weights["zia_match"]
        license_score = weights["license_valid"] if license_status.get("valid", False) else 0
        experience_score = min(candidate.get("years_experience", 0) / 10, weights["experience"])
        
        return min(base_score + license_score + experience_score, 1.0)
    
    async def _attempt_email_engagement(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """Attempt email engagement with calendar scheduling"""
        try:
            # Propose meeting slots
            calendar_result = await self.calendar_tool.propose_meeting_slots(
                candidate["email"],
                "Initial Interview - Impact Realty",
                duration_minutes=30
            )
            
            if calendar_result["status"] == "success":
                # Send engagement email
                template = self.config["engagement"]["templates"]["initial_contact"]
                message = template.format(name=candidate.get("name", ""))
                
                email_result = await self.mail_tool.send_engagement_email(
                    candidate["email"],
                    candidate.get("name", ""),
                    calendar_result["meeting_link"]
                )
                
                return {
                    "method": "email",
                    "status": "success",
                    "meeting_scheduled": calendar_result["meeting_time"]
                }
            
            return {"method": "email", "status": "failed", "reason": "Calendar booking failed"}
            
        except Exception as e:
            return {"method": "email", "status": "error", "message": str(e)}
    
    async def _attempt_sms_engagement(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """Attempt SMS engagement via VAPI"""
        try:
            sms_result = await self.vapi_tool.send_engagement_sms(
                candidate["phone"],
                candidate.get("name", "")
            )
            
            return {
                "method": "sms",
                "status": sms_result.get("status", "failed")
            }
            
        except Exception as e:
            return {"method": "sms", "status": "error", "message": str(e)}
    
    def _determine_next_steps(self, engagement_results: Dict[str, Any]) -> List[str]:
        """Determine next steps based on engagement results"""
        next_steps = []
        
        if engagement_results["successful_contacts"]:
            next_steps.append("Monitor for response within 24 hours")
            next_steps.append("Schedule follow-up based on response")
        else:
            next_steps.append("Try alternative contact methods")
            next_steps.append("Update contact information if needed")
        
        return next_steps
    
    async def get_status(self) -> Dict[str, Any]:
        """Get recruitment department status"""
        return {
            "status": "active",
            "metrics": self.metrics,
            "config": {
                "sourcing_enabled": True,
                "qualification_threshold": self.config["qualification"]["min_score_threshold"],
                "engagement_channels": len(self.config["engagement"]["communication_preferences"])
            }
        } 