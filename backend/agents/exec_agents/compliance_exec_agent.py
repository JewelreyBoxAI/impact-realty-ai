"""
Compliance Executive Agent - Consolidated
========================================

Handles all compliance operations in one agent:
- Document Intake (automated processing)
- Signature Validation (SOP compliance)
- Commission Split Verification (mathematical + regulatory)
- Disbursement Readiness (cross-system checks)
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from decimal import Decimal
from tools.zoho_crm_tool import ZohoCRMTool
from tools.broker_sumo_tool import BrokerSumoTool
from tools.pdf_parser_tool import PDFParserTool
from tools.zoho_sign_tool import ZohoSignTool
from memory.vector_memory_manager import VectorMemoryManager

logger = logging.getLogger(__name__)

class ComplianceExecAgent:
    """
    Consolidated Compliance Executive Agent (Karen's Operations)
    """
    
    def __init__(self):
        # Tool integrations
        self.zoho_crm = ZohoCRMTool()
        self.broker_sumo = BrokerSumoTool()
        self.pdf_parser = PDFParserTool()
        self.zoho_sign = ZohoSignTool()
        self.memory_manager = VectorMemoryManager()
        
        # Compliance configuration (JSON-driven)
        self.config = {
            "document_types": {
                "purchase_agreement": {
                    "required_signatures": ["buyer", "seller", "agent"],
                    "optional_signatures": ["broker"],
                    "key_fields": ["purchase_price", "closing_date", "commission"]
                },
                "listing_agreement": {
                    "required_signatures": ["seller", "listing_agent"],
                    "optional_signatures": [],
                    "key_fields": ["list_price", "commission_rate", "expiration_date"]
                },
                "commission_agreement": {
                    "required_signatures": ["agent", "broker"],
                    "optional_signatures": [],
                    "key_fields": ["commission_split", "agent_percentage", "broker_percentage"]
                }
            },
            "commission_validation": {
                "tolerance": 0.01,  # $0.01 for amounts, 0.01% for percentages
                "max_recipients": 10,
                "required_fields": ["agent_id", "amount", "percentage"]
            },
            "disbursement_criteria": {
                "required_documents": ["signed_purchase_agreement", "commission_agreement"],
                "required_approvals": ["broker_approval", "compliance_check"],
                "minimum_wait_hours": 24
            }
        }
        
        # Metrics tracking
        self.metrics = {
            "documents_processed": 0,
            "signatures_validated": 0,
            "commissions_verified": 0,
            "disbursements_approved": 0,
            "compliance_rate": 0.0
        }
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process compliance requests"""
        action = request.get("action")
        
        if action == "intake_document":
            return await self._intake_document(request.get("document_path"))
        elif action == "validate_signatures":
            return await self._validate_signatures(request.get("document_id"))
        elif action == "verify_commission":
            return await self._verify_commission_split(request.get("deal_id"))
        elif action == "check_disbursement":
            return await self._check_disbursement_readiness(request.get("deal_id"))
        elif action == "full_compliance_check":
            return await self._full_compliance_check(request.get("deal_id"))
        else:
            return {"error": "Unknown compliance action", "status": "failed"}
    
    async def _intake_document(self, document_path: str) -> Dict[str, Any]:
        """Process document intake with automated classification"""
        try:
            # Parse document content
            parsed_content = await self.pdf_parser.parse_document(document_path)
            
            # Auto-classify document type
            document_type = self._classify_document(parsed_content)
            
            # Extract key fields based on document type
            extracted_fields = self._extract_document_fields(parsed_content, document_type)
            
            # Generate document metadata
            document_metadata = {
                "document_id": f"doc_{parsed_content.get('hash', 'unknown')}",
                "type": document_type,
                "extracted_fields": extracted_fields,
                "requires_review": self._requires_manual_review(document_type, extracted_fields),
                "intake_timestamp": datetime.now().isoformat()
            }
            
            # Store document embeddings for search
            await self.memory_manager.store_document_embeddings(
                document_metadata["document_id"],
                parsed_content["text"]
            )
            
            # Create review task if needed
            if document_metadata["requires_review"]:
                await self.zoho_crm.create_compliance_task({
                    "type": "document_review",
                    "document_id": document_metadata["document_id"],
                    "priority": "high" if document_type == "unknown" else "medium"
                })
            
            self.metrics["documents_processed"] += 1
            
            return {
                "status": "success",
                "document": document_metadata,
                "next_steps": self._determine_document_next_steps(document_metadata)
            }
            
        except Exception as e:
            logger.error(f"Document intake error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _validate_signatures(self, document_id: str) -> Dict[str, Any]:
        """Validate all required signatures on document"""
        try:
            # Get document and parse signature fields
            document = await self._get_document_info(document_id)
            signature_fields = await self.pdf_parser.extract_signature_fields(document["path"])
            
            # Get signature requirements for this document type
            doc_config = self.config["document_types"].get(document["type"], {})
            required_sigs = doc_config.get("required_signatures", [])
            optional_sigs = doc_config.get("optional_signatures", [])
            
            # Validate each signature requirement
            validation_results = []
            for sig_role in required_sigs:
                result = self._validate_signature_role(signature_fields, sig_role, required=True)
                validation_results.append(result)
            
            for sig_role in optional_sigs:
                result = self._validate_signature_role(signature_fields, sig_role, required=False)
                validation_results.append(result)
            
            # Overall compliance status
            required_valid = all(r["valid"] for r in validation_results if r["required"])
            compliance_status = "compliant" if required_valid else "non_compliant"
            
            # Log issues if any
            if not required_valid:
                await self._log_compliance_issue("signature_validation", {
                    "document_id": document_id,
                    "validation_results": validation_results
                })
            
            self.metrics["signatures_validated"] += 1
            
            return {
                "status": "success",
                "document_id": document_id,
                "compliance_status": compliance_status,
                "signature_details": validation_results,
                "summary": {
                    "required_signatures": len(required_sigs),
                    "valid_required": sum(1 for r in validation_results if r["required"] and r["valid"]),
                    "optional_signatures": len(optional_sigs),
                    "valid_optional": sum(1 for r in validation_results if not r["required"] and r["valid"])
                }
            }
            
        except Exception as e:
            logger.error(f"Signature validation error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _verify_commission_split(self, deal_id: str) -> Dict[str, Any]:
        """Verify commission split calculations and compliance"""
        try:
            # Get deal and commission data
            deal_info = await self.zoho_crm.get_deal(deal_id)
            commission_data = await self.broker_sumo.get_commission_data(deal_id)
            
            total_commission = Decimal(str(deal_info.get("total_commission", 0)))
            splits = commission_data.get("splits", [])
            
            verification_results = {
                "mathematical_validation": self._verify_commission_math(total_commission, splits),
                "regulatory_compliance": self._verify_regulatory_compliance(splits),
                "agreement_validation": await self._verify_split_agreements(deal_id, splits)
            }
            
            # Overall validation status
            all_valid = all(
                result["valid"] for result in verification_results.values()
            )
            
            # Log issues if validation fails
            if not all_valid:
                await self._log_compliance_issue("commission_verification", {
                    "deal_id": deal_id,
                    "verification_results": verification_results
                })
            
            self.metrics["commissions_verified"] += 1
            
            return {
                "status": "success",
                "deal_id": deal_id,
                "commission_valid": all_valid,
                "total_commission": str(total_commission),
                "verification_details": verification_results
            }
            
        except Exception as e:
            logger.error(f"Commission verification error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _check_disbursement_readiness(self, deal_id: str) -> Dict[str, Any]:
        """Check if deal is ready for disbursement"""
        try:
            readiness_checks = {
                "documents_complete": await self._check_required_documents(deal_id),
                "signatures_valid": await self._check_all_signatures_valid(deal_id),
                "commission_verified": await self._check_commission_verified(deal_id),
                "broker_approval": await self._check_broker_approval(deal_id),
                "waiting_period": self._check_waiting_period(deal_id)
            }
            
            # Overall readiness
            ready_for_disbursement = all(
                check["status"] for check in readiness_checks.values()
            )
            
            # Generate action items for incomplete items
            action_items = []
            for check_name, check_result in readiness_checks.items():
                if not check_result["status"]:
                    action_items.append({
                        "item": check_name,
                        "required_action": check_result.get("required_action", "Manual review needed")
                    })
            
            if ready_for_disbursement:
                self.metrics["disbursements_approved"] += 1
            
            return {
                "status": "success",
                "deal_id": deal_id,
                "ready_for_disbursement": ready_for_disbursement,
                "readiness_checks": readiness_checks,
                "action_items": action_items
            }
            
        except Exception as e:
            logger.error(f"Disbursement readiness error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _full_compliance_check(self, deal_id: str) -> Dict[str, Any]:
        """Run complete compliance check for a deal"""
        compliance_results = {
            "document_intake": None,
            "signature_validation": None,
            "commission_verification": None,
            "disbursement_readiness": None,
            "overall_compliance": {}
        }
        
        try:
            # Run all compliance checks
            # Note: This would need document_id mapping for signature validation
            commission_result = await self._verify_commission_split(deal_id)
            disbursement_result = await self._check_disbursement_readiness(deal_id)
            
            compliance_results["commission_verification"] = commission_result
            compliance_results["disbursement_readiness"] = disbursement_result
            
            # Calculate overall compliance score
            compliance_score = self._calculate_compliance_score(compliance_results)
            
            compliance_results["overall_compliance"] = {
                "score": compliance_score,
                "status": "compliant" if compliance_score >= 0.8 else "non_compliant",
                "summary": self._generate_compliance_summary(compliance_results)
            }
            
            return {"status": "success", "compliance": compliance_results}
            
        except Exception as e:
            logger.error(f"Full compliance check error: {e}")
            return {"status": "error", "message": str(e)}
    
    # Helper methods
    def _classify_document(self, parsed_content: Dict[str, Any]) -> str:
        """Auto-classify document type based on content"""
        text = parsed_content.get("text", "").lower()
        
        classification_keywords = {
            "purchase_agreement": ["purchase agreement", "buy", "purchase price", "closing date"],
            "listing_agreement": ["listing agreement", "list price", "mls", "marketing"],
            "commission_agreement": ["commission split", "agent commission", "broker fee"]
        }
        
        for doc_type, keywords in classification_keywords.items():
            if any(keyword in text for keyword in keywords):
                return doc_type
        
        return "unknown"
    
    def _extract_document_fields(self, parsed_content: Dict[str, Any], document_type: str) -> Dict[str, Any]:
        """Extract key fields based on document type"""
        # Simplified field extraction - would use more sophisticated parsing in production
        return {
            "extracted_fields": [],
            "confidence": 0.8
        }
    
    def _requires_manual_review(self, document_type: str, extracted_fields: Dict[str, Any]) -> bool:
        """Determine if document requires manual review"""
        return document_type == "unknown" or extracted_fields.get("confidence", 0) < 0.7
    
    def _determine_document_next_steps(self, document_metadata: Dict[str, Any]) -> List[str]:
        """Determine next steps for processed document"""
        next_steps = []
        
        if document_metadata["requires_review"]:
            next_steps.append("Manual review required")
        else:
            next_steps.append("Proceed with signature validation")
            
        if document_metadata["type"] in ["purchase_agreement", "commission_agreement"]:
            next_steps.append("Queue for commission verification")
            
        return next_steps
    
    def _validate_signature_role(self, signature_fields: List[Dict], role: str, required: bool) -> Dict[str, Any]:
        """Validate signature for specific role"""
        matching_field = None
        for field in signature_fields:
            if field.get("role") == role or role in field.get("field_name", "").lower():
                matching_field = field
                break
        
        if matching_field:
            return {
                "role": role,
                "valid": matching_field.get("signed", False),
                "signature_date": matching_field.get("date"),
                "required": required
            }
        else:
            return {
                "role": role,
                "valid": False,
                "signature_date": None,
                "required": required,
                "issue": "Signature field not found"
            }
    
    def _verify_commission_math(self, total_commission: Decimal, splits: List[Dict]) -> Dict[str, Any]:
        """Verify mathematical accuracy of commission splits"""
        try:
            calculated_total = Decimal('0')
            percentage_total = Decimal('0')
            
            for split in splits:
                amount = Decimal(str(split.get("amount", 0)))
                percentage = Decimal(str(split.get("percentage", 0)))
                
                calculated_total += amount
                percentage_total += percentage
            
            # Check totals (allowing for small rounding differences)
            amount_diff = abs(calculated_total - total_commission)
            percentage_diff = abs(percentage_total - Decimal('100'))
            
            tolerance = Decimal(str(self.config["commission_validation"]["tolerance"]))
            amount_valid = amount_diff <= tolerance
            percentage_valid = percentage_diff <= tolerance
            
            issues = []
            if not amount_valid:
                issues.append(f"Amount mismatch: {amount_diff}")
            if not percentage_valid:
                issues.append(f"Percentage mismatch: {percentage_diff}")
            
            return {
                "valid": amount_valid and percentage_valid,
                "calculated_total": str(calculated_total),
                "expected_total": str(total_commission),
                "percentage_total": str(percentage_total),
                "amount_difference": str(amount_diff),
                "percentage_difference": str(percentage_diff),
                "issues": issues
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def _verify_regulatory_compliance(self, splits: List[Dict]) -> Dict[str, Any]:
        """Verify regulatory compliance of commission splits"""
        issues = []
        
        # Check number of recipients
        if len(splits) > self.config["commission_validation"]["max_recipients"]:
            issues.append("Excessive number of commission recipients")
        
        # Check for unlicensed recipients
        for split in splits:
            if not split.get("recipient_licensed", True):
                issues.append(f"Unlicensed recipient: {split.get('recipient_name')}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
    
    async def _verify_split_agreements(self, deal_id: str, splits: List[Dict]) -> Dict[str, Any]:
        """Verify splits match signed agreements"""
        try:
            # Get agent agreements from Zoho CRM
            agreements = await self.zoho_crm.get_commission_agreements(deal_id)
            
            validation_results = []
            for split in splits:
                agent_id = split.get("agent_id")
                agreed_percentage = None
                
                # Find matching agreement
                for agreement in agreements:
                    if agreement.get("agent_id") == agent_id:
                        agreed_percentage = Decimal(str(agreement.get("commission_percentage", 0)))
                        break
                
                if agreed_percentage is not None:
                    split_percentage = Decimal(str(split.get("percentage", 0)))
                    tolerance = Decimal(str(self.config["commission_validation"]["tolerance"]))
                    matches_agreement = abs(split_percentage - agreed_percentage) <= tolerance
                    
                    validation_results.append({
                        "agent_id": agent_id,
                        "valid": matches_agreement,
                        "agreed_percentage": str(agreed_percentage),
                        "actual_percentage": str(split_percentage),
                        "difference": str(abs(split_percentage - agreed_percentage))
                    })
                else:
                    validation_results.append({
                        "agent_id": agent_id,
                        "valid": False,
                        "issue": "No commission agreement found"
                    })
            
            all_valid = all(result["valid"] for result in validation_results)
            
            return {
                "valid": all_valid,
                "agent_validations": validation_results
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    # Disbursement helper methods
    async def _check_required_documents(self, deal_id: str) -> Dict[str, Any]:
        """Check if all required documents are present"""
        try:
            required_docs = self.config["disbursement_criteria"]["required_documents"]
            deal_documents = await self.zoho_crm.get_deal_documents(deal_id)
            
            missing_documents = []
            for required_doc in required_docs:
                if not any(doc.get("type") == required_doc for doc in deal_documents):
                    missing_documents.append(required_doc)
            
            return {
                "status": len(missing_documents) == 0,
                "missing_documents": missing_documents,
                "required_action": "Upload missing documents" if missing_documents else None
            }
        except Exception as e:
            return {"status": False, "error": str(e)}
    
    async def _check_all_signatures_valid(self, deal_id: str) -> Dict[str, Any]:
        """Check if all signatures are valid"""
        try:
            deal_documents = await self.zoho_crm.get_deal_documents(deal_id)
            invalid_signatures = []
            
            for doc in deal_documents:
                if doc.get("requires_signature", False):
                    signature_result = await self._validate_signatures(doc.get("id"))
                    if not signature_result.get("all_signatures_valid", False):
                        invalid_signatures.append({
                            "document_id": doc.get("id"),
                            "document_type": doc.get("type"),
                            "issues": signature_result.get("signature_details", [])
                        })
            
            return {
                "status": len(invalid_signatures) == 0,
                "invalid_signatures": invalid_signatures,
                "required_action": "Complete missing signatures" if invalid_signatures else None
            }
        except Exception as e:
            return {"status": False, "error": str(e)}
    
    async def _check_commission_verified(self, deal_id: str) -> Dict[str, Any]:
        """Check if commission has been verified"""
        try:
            commission_result = await self._verify_commission_split(deal_id)
            is_verified = commission_result.get("commission_valid", False)
            
            return {
                "status": is_verified,
                "required_action": "Fix commission verification issues" if not is_verified else None,
                "verification_details": commission_result.get("verification_details", {})
            }
        except Exception as e:
            return {"status": False, "error": str(e)}
    
    async def _check_broker_approval(self, deal_id: str) -> Dict[str, Any]:
        """Check if broker approval is obtained"""
        try:
            approvals = await self.zoho_crm.get_deal_approvals(deal_id)
            broker_approved = any(
                approval.get("role") == "broker" and approval.get("status") == "approved" 
                for approval in approvals
            )
            
            return {
                "status": broker_approved,
                "required_action": "Obtain broker approval" if not broker_approved else None,
                "approvals": approvals
            }
        except Exception as e:
            return {"status": False, "error": str(e)}
    
    def _check_waiting_period(self, deal_id: str) -> Dict[str, Any]:
        """Check if minimum waiting period has passed"""
        try:
            # This would check against deal creation/submission time
            min_wait_hours = self.config["disbursement_criteria"]["minimum_wait_hours"]
            # Check actual waiting period from document timestamps
            waiting_period_met = self._check_actual_waiting_period(deal_id, document_data)
            
            return {
                "status": waiting_period_met,
                "required_action": f"Wait {min_wait_hours} hours minimum" if not waiting_period_met else None,
                "minimum_wait_hours": min_wait_hours
            }
        except Exception as e:
            return {"status": False, "error": str(e)}
    
    def _check_actual_waiting_period(self, deal_id: str, document_data: Dict[str, Any]) -> bool:
        """Check if actual waiting period requirements are met"""
        try:
            # Get document timestamps
            signatures = document_data.get("signatures", [])
            if not signatures:
                return False
            
            # Check if all required signatures are completed
            all_signed = all(sig.get("is_valid", False) for sig in signatures)
            if not all_signed:
                return False
            
            # Find the latest signature date
            latest_signature_date = None
            for sig in signatures:
                if sig.get("signed_date"):
                    try:
                        sig_date = datetime.fromisoformat(sig["signed_date"].replace("Z", "+00:00"))
                        if not latest_signature_date or sig_date > latest_signature_date:
                            latest_signature_date = sig_date
                    except:
                        continue
            
            if not latest_signature_date:
                return False
            
            # Check waiting period (typically 3 business days for real estate)
            required_waiting_days = 3
            waiting_end_date = latest_signature_date + timedelta(days=required_waiting_days)
            
            return datetime.now() >= waiting_end_date
            
        except Exception as e:
            print(f"Error checking waiting period: {e}")
            return False
    
    async def _get_document_info(self, document_id: str) -> Dict[str, Any]:
        """Get document information"""
        return {
            "id": document_id,
            "type": "purchase_agreement",
            "path": f"/documents/{document_id}.pdf"
        }
    
    async def _log_compliance_issue(self, issue_type: str, details: Dict[str, Any]) -> None:
        """Log compliance issues for review"""
        logger.warning(f"Compliance issue - {issue_type}: {details}")
        
        await self.zoho_crm.create_compliance_task({
            "type": f"{issue_type}_failed",
            "details": details,
            "priority": "high"
        })
    
    def _calculate_compliance_score(self, compliance_results: Dict[str, Any]) -> float:
        """Calculate overall compliance score based on detailed analysis"""
        try:
            total_weight = 0
            weighted_score = 0
            
            # Weight different compliance checks
            check_weights = {
                "document_validation": 0.25,
                "signature_verification": 0.25,
                "commission_split_validation": 0.20,
                "disbursement_readiness": 0.20,
                "regulatory_compliance": 0.10
            }
            
            for check_type, weight in check_weights.items():
                check_result = compliance_results.get(check_type, {})
                
                if isinstance(check_result, dict):
                    # Extract score from check result
                    if "score" in check_result:
                        score = float(check_result["score"])
                    elif "valid" in check_result:
                        score = 1.0 if check_result["valid"] else 0.0
                    elif "passed" in check_result:
                        score = 1.0 if check_result["passed"] else 0.0
                    else:
                        # Default scoring based on presence of errors
                        score = 0.0 if check_result.get("errors") else 1.0
                    
                    weighted_score += score * weight
                    total_weight += weight
            
            # Normalize score
            final_score = weighted_score / total_weight if total_weight > 0 else 0.0
            return min(max(final_score, 0.0), 1.0)  # Ensure score is between 0 and 1
            
        except Exception as e:
            print(f"Error calculating compliance score: {e}")
            return 0.0
    
    def _generate_compliance_summary(self, compliance_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed compliance summary with actionable insights"""
        try:
            total_checks = 0
            passed_checks = 0
            critical_issues = []
            warnings = []
            recommendations = []
            
            # Analyze each compliance check
            for check_type, result in compliance_results.items():
                total_checks += 1
                
                if isinstance(result, dict):
                    # Check if this test passed
                    passed = False
                    if "valid" in result:
                        passed = result["valid"]
                    elif "passed" in result:
                        passed = result["passed"]
                    elif "score" in result:
                        passed = float(result["score"]) >= 0.8
                    else:
                        passed = not result.get("errors")
                    
                    if passed:
                        passed_checks += 1
                    
                    # Extract issues
                    if result.get("errors"):
                        for error in result["errors"]:
                            critical_issues.append({
                                "type": check_type,
                                "issue": error,
                                "severity": "critical"
                            })
                    
                    if result.get("warnings"):
                        for warning in result["warnings"]:
                            warnings.append({
                                "type": check_type,
                                "issue": warning,
                                "severity": "warning"
                            })
            
            # Generate recommendations based on issues
            if critical_issues:
                recommendations.append("Address all critical compliance issues before proceeding")
            
            if passed_checks / total_checks < 0.8:
                recommendations.append("Schedule compliance review with legal team")
            
            if any("signature" in issue["type"] for issue in critical_issues):
                recommendations.append("Verify all required signatures are properly executed")
            
            if any("commission" in issue["type"] for issue in critical_issues):
                recommendations.append("Review commission split agreements for accuracy")
            
            return {
                "total_checks": total_checks,
                "passed_checks": passed_checks,
                "pass_rate": passed_checks / total_checks if total_checks > 0 else 0,
                "critical_issues": len(critical_issues),
                "warnings": len(warnings),
                "issue_details": critical_issues + warnings,
                "recommendations": recommendations,
                "compliance_level": ("high" if passed_checks / total_checks >= 0.9 else 
                                 "medium" if passed_checks / total_checks >= 0.7 else "low")
            }
            
        except Exception as e:
            print(f"Error generating compliance summary: {e}")
            return {
                "total_checks": 0,
                "passed_checks": 0,
                "critical_issues": 1,
                "recommendations": ["Manual compliance review required due to system error"]
            }
    
    async def get_status(self) -> Dict[str, Any]:
        """Get compliance executive status"""
        return {
            "status": "active",
            "metrics": self.metrics,
            "config": {
                "document_types_supported": len(self.config["document_types"]),
                "compliance_threshold": 0.8,
                "auto_processing_enabled": True
            }
        } 