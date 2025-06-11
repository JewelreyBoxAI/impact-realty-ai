"""
Supervisor Agent - Consolidated
==============================

Main orchestrator for all Impact Realty AI operations including:
- Recruitment Department (Eileen's operations)
- Compliance Executive (Karen's operations) 
- Kevin's Assistant (email, calendar, advisory)
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
from ..exec_agents.recruitment_dept_agent import RecruitmentDeptAgent
from ..exec_agents.compliance_exec_agent import ComplianceExecAgent
from tools.zoho_crm_tool import ZohoCRMTool
from tools.zoho_mail_tool import ZohoMailTool
from tools.zoho_calendar_tool import ZohoCalendarTool

logger = logging.getLogger(__name__)

class SupervisorAgent:
    """
    Consolidated Supervisor Agent managing all operations
    """
    
    def __init__(self):
        # Executive agents for complex workflows
        self.recruitment_agent = RecruitmentDeptAgent()
        self.compliance_agent = ComplianceExecAgent()
        
        # Kevin's assistant tools (integrated directly)
        self.zoho_crm = ZohoCRMTool()
        self.zoho_mail = ZohoMailTool()
        self.zoho_calendar = ZohoCalendarTool()
        
        # Kevin's assistant configuration (JSON-based)
        self.kevin_config = {
            "email_processing": {
                "priority_keywords": ["urgent", "closing", "commission", "compliance"],
                "auto_reply_templates": {
                    "meeting_request": "Thank you for reaching out. I'll review your request and get back to you within 24 hours.",
                    "property_inquiry": "Thanks for your interest. Let me gather the details and respond shortly."
                }
            },
            "calendar_management": {
                "working_hours": {"start": "08:00", "end": "18:00"},
                "buffer_between_meetings": 15,  # minutes
                "auto_decline_conflicts": True
            },
            "advisory_topics": [
                "commercial_development",
                "post_disaster_recovery", 
                "market_analysis",
                "investment_opportunities"
            ]
        }
        
    async def route_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Route requests to appropriate handlers"""
        request_type = request.get("type")
        
        if request_type == "recruitment":
            return await self.recruitment_agent.process_request(request)
        elif request_type == "compliance":
            return await self.compliance_agent.process_request(request)
        elif request_type == "kevin_assistant":
            return await self._handle_kevin_request(request)
        else:
            return {"error": "Unknown request type", "status": "failed"}
    
    async def _handle_kevin_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle Kevin's assistant requests using integrated functionality"""
        action = request.get("action")
        
        if action == "process_emails":
            return await self._process_kevins_emails()
        elif action == "manage_calendar":
            return await self._manage_kevins_calendar(request.get("date"))
        elif action == "commercial_advisory":
            return await self._provide_commercial_advisory(request.get("topic"))
        elif action == "recovery_advisory":
            return await self._track_recovery_progress()
        else:
            return {"error": "Unknown Kevin assistant action", "status": "failed"}
    
    async def _process_kevins_emails(self) -> Dict[str, Any]:
        """Process Kevin's emails using configuration-driven approach"""
        try:
            # Get recent emails
            emails = await self.zoho_mail.get_recent_emails()
            
            processed = []
            for email in emails:
                # Priority scoring based on keywords
                priority_score = self._calculate_email_priority(email)
                
                # Auto-categorize
                category = self._categorize_email(email)
                
                processed.append({
                    "id": email.get("id"),
                    "subject": email.get("subject"),
                    "priority_score": priority_score,
                    "category": category,
                    "suggested_action": self._suggest_email_action(email, category)
                })
            
            return {
                "status": "success",
                "emails_processed": len(processed),
                "priority_emails": [e for e in processed if e["priority_score"] > 7],
                "processed_emails": processed
            }
            
        except Exception as e:
            logger.error(f"Email processing error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _manage_kevins_calendar(self, date: str = None) -> Dict[str, Any]:
        """Manage Kevin's calendar with intelligent optimization"""
        try:
            target_date = date or datetime.now().strftime("%Y-%m-%d")
            
            # Get day's events
            events = await self.zoho_calendar.get_events_for_date(target_date)
            
            # Analyze schedule
            analysis = {
                "total_events": len(events),
                "free_time_blocks": self._find_free_time_blocks(events),
                "conflicts": self._detect_conflicts(events),
                "optimization_suggestions": self._suggest_calendar_optimizations(events)
            }
            
            return {
                "status": "success",
                "date": target_date,
                "schedule_analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Calendar management error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _provide_commercial_advisory(self, topic: str) -> Dict[str, Any]:
        """Provide commercial advisory using structured data approach"""
        advisory_data = {
            "commercial_development": {
                "current_projects": [
                    {"name": "Tampa Bay Plaza", "phase": "planning", "status": "on_track"},
                    {"name": "Westshore Office Complex", "phase": "construction", "status": "delayed"}
                ],
                "market_indicators": {
                    "commercial_demand": "high",
                    "construction_costs": "elevated",
                    "permit_processing_time": "14_days_avg"
                }
            },
            "market_analysis": {
                "residential": {"trend": "stable", "inventory": "low"},
                "commercial": {"trend": "growing", "inventory": "moderate"}
            }
        }
        
        return {
            "status": "success",
            "topic": topic,
            "advisory": advisory_data.get(topic, {"message": "Topic not found"})
        }
    
    async def _track_recovery_progress(self) -> Dict[str, Any]:
        """Track post-disaster recovery operations (Helene/Milton)"""
        recovery_status = {
            "helene_recovery": {
                "permits_processed": 245,
                "properties_assessed": 312,
                "reconstruction_started": 89,
                "completion_rate": "28.5%"
            },
            "milton_recovery": {
                "permits_processed": 156,
                "properties_assessed": 203,
                "reconstruction_started": 45,
                "completion_rate": "22.2%"
            },
            "overall_progress": {
                "total_affected_properties": 515,
                "fully_restored": 134,
                "in_progress": 134,
                "pending_assessment": 247
            }
        }
        
        return {
            "status": "success",
            "recovery_data": recovery_status,
            "last_updated": datetime.now().isoformat()
        }
    
    # Helper methods for email processing
    def _calculate_email_priority(self, email: Dict[str, Any]) -> int:
        """Calculate email priority score (1-10)"""
        score = 5  # baseline
        subject = email.get("subject", "").lower()
        sender = email.get("sender", "").lower()
        
        # Keyword-based scoring
        for keyword in self.kevin_config["email_processing"]["priority_keywords"]:
            if keyword in subject:
                score += 2
        
        # VIP sender boost
        if any(vip in sender for vip in ["broker", "compliance", "executive"]):
            score += 1
            
        return min(score, 10)
    
    def _categorize_email(self, email: Dict[str, Any]) -> str:
        """Categorize email based on content"""
        subject = email.get("subject", "").lower()
        
        if any(word in subject for word in ["meeting", "schedule", "calendar"]):
            return "scheduling"
        elif any(word in subject for word in ["compliance", "document", "signature"]):
            return "compliance"
        elif any(word in subject for word in ["property", "listing", "showing"]):
            return "real_estate"
        else:
            return "general"
    
    def _suggest_email_action(self, email: Dict[str, Any], category: str) -> str:
        """Suggest action for email based on category"""
        action_map = {
            "scheduling": "review_calendar_and_respond",
            "compliance": "forward_to_karen",
            "real_estate": "review_and_prioritize",
            "general": "standard_review"
        }
        return action_map.get(category, "manual_review")
    
    def _find_free_time_blocks(self, events: List[Dict]) -> List[Dict]:
        """Find free time blocks in schedule based on actual events"""
        if not events:
            # Default business hours blocks if no events
            return [
                {"start": "09:00", "end": "12:00", "duration": 180},
                {"start": "13:00", "end": "17:00", "duration": 240}
            ]
        
        # Sort events by start time
        sorted_events = sorted(events, key=lambda x: x.get("start", "00:00"))
        free_blocks = []
        
        # Business hours: 9 AM to 6 PM
        business_start = "09:00"
        business_end = "18:00"
        
        current_time = business_start
        
        for event in sorted_events:
            event_start = event.get("start", "00:00")
            event_end = event.get("end", event_start)
            
            # If there's a gap before this event
            if self._time_to_minutes(event_start) > self._time_to_minutes(current_time):
                gap_duration = self._time_to_minutes(event_start) - self._time_to_minutes(current_time)
                if gap_duration >= 30:  # Only consider gaps of 30+ minutes
                    free_blocks.append({
                        "start": current_time,
                        "end": event_start,
                        "duration": gap_duration
                    })
            
            # Update current time to end of this event
            current_time = event_end
        
        # Check for time after last event
        if self._time_to_minutes(business_end) > self._time_to_minutes(current_time):
            remaining_duration = self._time_to_minutes(business_end) - self._time_to_minutes(current_time)
            if remaining_duration >= 30:
                free_blocks.append({
                    "start": current_time,
                    "end": business_end,
                    "duration": remaining_duration
                })
        
        return free_blocks
    
    def _detect_conflicts(self, events: List[Dict]) -> List[Dict]:
        """Detect scheduling conflicts between events"""
        conflicts = []
        
        if len(events) < 2:
            return conflicts
        
        # Sort events by start time
        sorted_events = sorted(events, key=lambda x: x.get("start", "00:00"))
        
        for i in range(len(sorted_events) - 1):
            current_event = sorted_events[i]
            next_event = sorted_events[i + 1]
            
            current_start = self._time_to_minutes(current_event.get("start", "00:00"))
            current_end = self._time_to_minutes(current_event.get("end", current_event.get("start", "00:00")))
            next_start = self._time_to_minutes(next_event.get("start", "00:00"))
            
            # Check for overlap
            if current_end > next_start:
                conflicts.append({
                    "type": "time_overlap",
                    "event1": current_event.get("title", "Unknown Event"),
                    "event2": next_event.get("title", "Unknown Event"),
                    "event1_time": f"{current_event.get('start', '')} - {current_event.get('end', '')}",
                    "event2_time": f"{next_event.get('start', '')} - {next_event.get('end', '')}",
                    "overlap_minutes": current_end - next_start
                })
        
        return conflicts
    
    def _time_to_minutes(self, time_str: str) -> int:
        """Convert time string (HH:MM) to minutes since midnight"""
        try:
            hours, minutes = map(int, time_str.split(":"))
            return hours * 60 + minutes
        except:
            return 0
    
    def _suggest_calendar_optimizations(self, events: List[Dict]) -> List[str]:
        """Suggest calendar optimizations"""
        suggestions = []
        if len(events) > 8:
            suggestions.append("Consider blocking focus time")
        if any(event.get("duration", 0) < 15 for event in events):
            suggestions.append("Consolidate short meetings")
        return suggestions
    
    def get_current_date(self) -> str:
        """Get current date in ISO format"""
        return datetime.now().strftime("%Y-%m-%d")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get overall system status"""
        return {
            "supervisor": "active",
            "recruitment": await self.recruitment_agent.get_status(),
            "compliance": await self.compliance_agent.get_status(),
            "kevin_assistant": {
                "email_processing": "active",
                "calendar_management": "active", 
                "advisory_services": "active"
            }
        }
