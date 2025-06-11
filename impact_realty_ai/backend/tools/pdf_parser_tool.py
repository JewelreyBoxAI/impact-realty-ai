"""
PDF Parser Tool
==============

Parses PDF documents for compliance processing.
"""

import os
import hashlib
import fitz  # PyMuPDF
from typing import Dict, Any, List
import re
from datetime import datetime

class PDFParserTool:
    def __init__(self):
        self.supported_formats = ['.pdf']
        
    async def parse_document(self, document_path: str) -> Dict[str, Any]:
        """Parse PDF document content and extract metadata"""
        if not os.path.exists(document_path):
            return {"error": "Document not found", "text": "", "hash": ""}
            
        if not document_path.lower().endswith('.pdf'):
            return {"error": "Unsupported document format", "text": "", "hash": ""}
            
        try:
            # Open PDF document
            doc = fitz.open(document_path)
            
            # Extract text from all pages
            full_text = ""
            page_texts = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                page_texts.append({
                    "page_number": page_num + 1,
                    "text": page_text,
                    "word_count": len(page_text.split())
                })
                full_text += page_text + "\n"
            
            # Generate document hash
            document_hash = hashlib.sha256(full_text.encode()).hexdigest()
            
            # Extract metadata
            metadata = doc.metadata
            
            # Analyze document structure
            analysis = self._analyze_document(full_text)
            
            doc.close()
            
            return {
                "status": "success",
                "text": full_text,
                "hash": document_hash,
                "page_count": len(doc),
                "pages": page_texts,
                "metadata": {
                    "title": metadata.get("title", ""),
                    "author": metadata.get("author", ""),
                    "subject": metadata.get("subject", ""),
                    "creator": metadata.get("creator", ""),
                    "producer": metadata.get("producer", ""),
                    "creation_date": metadata.get("creationDate", ""),
                    "modification_date": metadata.get("modDate", "")
                },
                "analysis": analysis,
                "extracted_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "error": f"PDF parsing failed: {str(e)}",
                "text": "",
                "hash": "",
                "status": "error"
            }
    
    async def extract_signature_fields(self, document_path: str) -> List[Dict[str, Any]]:
        """Extract signature fields and form data from PDF"""
        if not os.path.exists(document_path):
            return []
            
        try:
            doc = fitz.open(document_path)
            signature_fields = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Get form fields
                form_fields = page.widgets()
                
                for field in form_fields:
                    field_info = {
                        "page": page_num + 1,
                        "field_type": field.field_type_string,
                        "field_name": field.field_name,
                        "field_value": field.field_value,
                        "rect": list(field.rect),
                        "is_signed": bool(field.field_value) if field.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE else False
                    }
                    
                    # Check if it's a signature field
                    if (field.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE or 
                        "signature" in field.field_name.lower() or
                        "sign" in field.field_name.lower()):
                        field_info["is_signature_field"] = True
                        signature_fields.append(field_info)
                
                # Also look for signature-related text patterns
                page_text = page.get_text()
                signature_patterns = [
                    r"signature.*?date",
                    r"signed.*?by",
                    r"electronic.*?signature",
                    r"digital.*?signature",
                    r"__+.*?date",  # Signature lines
                    r"X.*?____"     # X marks signature spots
                ]
                
                for pattern in signature_patterns:
                    matches = re.finditer(pattern, page_text, re.IGNORECASE)
                    for match in matches:
                        signature_fields.append({
                            "page": page_num + 1,
                            "field_type": "text_signature_indicator",
                            "field_name": f"signature_text_{match.start()}",
                            "field_value": match.group(),
                            "position": match.span(),
                            "is_signature_field": True,
                            "is_signed": False  # Would need OCR to detect actual signatures
                        })
            
            doc.close()
            return signature_fields
            
        except Exception as e:
            print(f"Error extracting signature fields: {e}")
            return []
    
    async def extract_key_data(self, document_path: str, document_type: str) -> Dict[str, Any]:
        """Extract key data points based on document type"""
        parse_result = await self.parse_document(document_path)
        
        if parse_result.get("error"):
            return {"error": parse_result["error"]}
            
        text = parse_result["text"]
        
        if document_type == "purchase_agreement":
            return self._extract_purchase_agreement_data(text)
        elif document_type == "commission_agreement":
            return self._extract_commission_agreement_data(text)
        elif document_type == "disclosure":
            return self._extract_disclosure_data(text)
        else:
            return {"extracted_data": {}, "document_type": document_type}
    
    def _analyze_document(self, text: str) -> Dict[str, Any]:
        """Analyze document content and structure"""
        word_count = len(text.split())
        char_count = len(text)
        
        # Look for common real estate document indicators
        document_indicators = {
            "purchase_agreement": ["purchase agreement", "purchase contract", "sales contract"],
            "commission_agreement": ["commission agreement", "listing agreement", "commission split"],
            "disclosure": ["disclosure", "property disclosure", "lead disclosure"],
            "addendum": ["addendum", "amendment", "modification"],
            "contract": ["contract", "agreement", "terms and conditions"]
        }
        
        likely_type = "unknown"
        confidence = 0.0
        
        text_lower = text.lower()
        for doc_type, indicators in document_indicators.items():
            matches = sum(1 for indicator in indicators if indicator in text_lower)
            type_confidence = matches / len(indicators)
            if type_confidence > confidence:
                confidence = type_confidence
                likely_type = doc_type
        
        # Extract common real estate terms
        re_terms = [
            "property", "buyer", "seller", "agent", "broker", "commission",
            "closing", "earnest money", "inspection", "appraisal", "title",
            "escrow", "mls", "listing", "offer", "counteroffer"
        ]
        
        found_terms = []
        for term in re_terms:
            if term in text_lower:
                found_terms.append(term)
        
        return {
            "word_count": word_count,
            "character_count": char_count,
            "likely_document_type": likely_type,
            "type_confidence": confidence,
            "real_estate_terms_found": found_terms,
            "has_signature_indicators": any(sig in text_lower for sig in ["signature", "signed", "sign here"]),
            "has_date_fields": bool(re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text)),
            "has_monetary_amounts": bool(re.search(r'\$[\d,]+\.?\d*', text))
        }
    
    def _extract_purchase_agreement_data(self, text: str) -> Dict[str, Any]:
        """Extract key data from purchase agreement"""
        data = {}
        
        # Extract price
        price_match = re.search(r'\$[\d,]+\.?\d*', text)
        if price_match:
            data["purchase_price"] = price_match.group()
        
        # Extract dates
        date_patterns = [
            r'closing date.*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'contract date.*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'effective date.*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_type = pattern.split('.*?')[0].replace('\\', '').strip()
                data[date_type] = match.group(1)
        
        # Extract property address
        address_pattern = r'property.*?address.*?([^\n]+)'
        address_match = re.search(address_pattern, text, re.IGNORECASE)
        if address_match:
            data["property_address"] = address_match.group(1).strip()
        
        return {"extracted_data": data, "document_type": "purchase_agreement"}
    
    def _extract_commission_agreement_data(self, text: str) -> Dict[str, Any]:
        """Extract key data from commission agreement"""
        data = {}
        
        # Extract commission percentages
        commission_pattern = r'(\d+\.?\d*)%'
        commission_matches = re.findall(commission_pattern, text)
        if commission_matches:
            data["commission_percentages"] = [float(c) for c in commission_matches]
        
        # Extract commission amounts
        amount_pattern = r'\$[\d,]+\.?\d*'
        amount_matches = re.findall(amount_pattern, text)
        if amount_matches:
            data["commission_amounts"] = amount_matches
        
        return {"extracted_data": data, "document_type": "commission_agreement"}
    
    def _extract_disclosure_data(self, text: str) -> Dict[str, Any]:
        """Extract key data from disclosure documents"""
        data = {}
        
        # Look for disclosure types
        disclosure_types = [
            "lead paint", "property condition", "natural hazards",
            "transfer disclosure", "seller disclosure"
        ]
        
        found_disclosures = []
        text_lower = text.lower()
        for disclosure_type in disclosure_types:
            if disclosure_type in text_lower:
                found_disclosures.append(disclosure_type)
        
        data["disclosure_types"] = found_disclosures
        
        return {"extracted_data": data, "document_type": "disclosure"} 