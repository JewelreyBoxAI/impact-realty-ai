"""
License Verification Tool
========================

Verifies real estate licenses via FL-DBPR API.
"""

import os
import httpx
from typing import Dict, Any

class LicenseVerificationTool:
    def __init__(self):
        self.fl_dbpr_base_url = "https://www.myfloridalicense.com/wl11.asp"
        self.timeout = 30
        
    async def verify_license(self, license_number: str, state: str = "FL") -> Dict[str, Any]:
        """Verify real estate license through FL-DBPR API"""
        if state != "FL":
            return {"valid": False, "error": "Only Florida licenses supported"}
            
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # FL-DBPR license lookup
                params = {
                    "SID": "1",
                    "FacilitySearchType": "1",
                    "FacilitySearchValue": license_number
                }
                
                response = await client.get(self.fl_dbpr_base_url, params=params)
                response.raise_for_status()
                
                # Parse response (FL-DBPR returns HTML)
                html_content = response.text
                
                if "License Information" in html_content:
                    # Extract license details from HTML
                    # This is a simplified parser - production would use BeautifulSoup
                    if "ACTIVE" in html_content.upper():
                        return {
                            "valid": True,
                            "status": "active",
                            "license_number": license_number,
                            "state": state,
                            "verified_at": response.headers.get("date")
                        }
                    else:
                        return {
                            "valid": False,
                            "status": "inactive",
                            "license_number": license_number,
                            "state": state
                        }
                else:
                    return {
                        "valid": False,
                        "error": "License not found",
                        "license_number": license_number,
                        "state": state
                    }
                    
        except httpx.TimeoutException:
            return {
                "valid": False,
                "error": "FL-DBPR API timeout",
                "license_number": license_number,
                "state": state
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Verification failed: {str(e)}",
                "license_number": license_number,
                "state": state
            } 