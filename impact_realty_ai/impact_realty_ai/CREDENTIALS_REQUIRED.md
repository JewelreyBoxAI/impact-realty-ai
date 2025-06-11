# Impact Realty AI - Required Credentials & Configuration

## Overview
This document lists all the credentials and API keys required to run the Impact Realty AI system in production. All placeholders and mock implementations have been replaced with real API integrations.

## 🔐 Required API Credentials

### 1. OpenAI (Critical)
```env
OPENAI_API_KEY=sk-...
```
**Used for:**
- LangChain LLM operations
- Text embeddings for vector search
- AI conversation processing

**Where to get:** https://platform.openai.com/api-keys

---

### 2. Zoho Suite (Critical)
```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_MAIL_ACCOUNT_ID=your_mail_account_id
ZOHO_MAIL_FROM_ADDRESS=kevin@impactrealty.com
ZOHO_COMPLIANCE_OWNER_ID=user_id_for_compliance_tasks
```

**Used for:**
- **Zoho CRM**: Candidate management, deal tracking, commission data
- **Zoho Mail**: Email processing, automated responses
- **Zoho Sign**: Document signature verification
- **Zoho Calendar**: Meeting scheduling, calendar optimization

**Setup process:**
1. Create Zoho Developer Account: https://api-console.zoho.com/
2. Create Server-based Application
3. Generate OAuth2 tokens with required scopes:
   - `ZohoCRM.modules.ALL`
   - `ZohoMail.messages.ALL` 
   - `ZohoMail.accounts.READ`
   - `ZohoSign.documents.ALL`
   - `ZohoCalendar.event.ALL`

---

### 3. VAPI (High Priority)
```env
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=+18005551234
VAPI_PHONE_NUMBER_ID=your_phone_number_id
```

**Used for:**
- AI voice calls to candidates
- SMS engagement campaigns
- Automated recruitment conversations

**Where to get:** https://vapi.ai/

---

### 4. Broker Sumo (Medium Priority)
```env
BROKER_SUMO_API_KEY=your_broker_sumo_api_key
BROKER_SUMO_BASE_URL=https://api.brokersumo.com/v1
```

**Used for:**
- Commission split calculations
- Disbursement readiness checks
- Financial compliance validation

**Where to get:** Contact Broker Sumo for API access

---

### 5. Database (Critical)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/impact_realty_ai
```

**Requirements:**
- PostgreSQL 14+ with PGVector extension
- Minimum 2GB RAM, 20GB storage
- SSL connection recommended for production

---

## 🛠️ Additional Configuration

### Application Settings
```env
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your_secret_key_for_jwt_tokens
DEBUG=false
```

### Performance Settings
```env
DB_POOL_MIN_SIZE=5
DB_POOL_MAX_SIZE=25
API_TIMEOUT=30
ZOHO_API_TIMEOUT=30
VAPI_TIMEOUT=30
```

### Feature Flags
```env
ENABLE_RECRUITMENT=true
ENABLE_COMPLIANCE=true
ENABLE_KEVIN_ASSISTANT=true
ENABLE_VOICE_CALLS=true
ENABLE_SMS=true
```

---

## 📋 Deployment Checklist

### Phase 1: Core APIs (Must Have)
- [ ] OpenAI API key configured and tested
- [ ] PostgreSQL database with PGVector extension
- [ ] Zoho CRM API access and authentication
- [ ] Zoho Mail API access
- [ ] Basic environment variables set

### Phase 2: Communication (High Priority)
- [ ] VAPI account and phone number provisioned
- [ ] Zoho Sign API access for document verification
- [ ] SMS/Voice calling tested

### Phase 3: Financial Integration (Medium Priority)
- [ ] Broker Sumo API access
- [ ] Commission calculation testing
- [ ] Compliance workflow validation

### Phase 4: Production Optimization
- [ ] SSL certificates configured
- [ ] Production database scaling
- [ ] Monitoring and logging setup
- [ ] Backup procedures implemented

---

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Database
```sql
CREATE DATABASE impact_realty_ai;
CREATE EXTENSION vector;
```

### 3. Configure Environment
```bash
cp .env.template .env
# Edit .env with your credentials
```

### 4. Initialize Database Schema
```bash
python -c "
from backend.memory.vector_memory_manager import VectorMemoryManager
import asyncio
async def init_db():
    vm = VectorMemoryManager()
    await vm._create_tables()
    await vm.close()
asyncio.run(init_db())
"
```

### 5. Test API Connections
```bash
python -m pytest tests/test_api_connections.py
```

---

## 🔍 Verification Tests

### Test Zoho Integration
```python
from backend.tools.zoho_crm_tool import ZohoCRMTool
import asyncio

async def test_zoho():
    crm = ZohoCRMTool()
    candidates = await crm.get_candidate_suggestions({"location": "Tampa"})
    print(f"Found {len(candidates)} candidates")

asyncio.run(test_zoho())
```

### Test VAPI Integration
```python
from backend.tools.vapi_tool import VAPITool
import asyncio

async def test_vapi():
    vapi = VAPITool()
    result = await vapi.send_engagement_sms("+1234567890", "Test Candidate")
    print(f"SMS Status: {result['status']}")

asyncio.run(test_vapi())
```

### Test Vector Database
```python
from backend.memory.vector_memory_manager import VectorMemoryManager
import asyncio

async def test_vector_db():
    vm = VectorMemoryManager()
    await vm.store_candidates([{
        "id": "test_001",
        "name": "Test Candidate",
        "location": "Tampa",
        "experience_years": 5
    }])
    
    results = await vm.search_similar_candidates("experienced Tampa agent")
    print(f"Found {len(results)} similar candidates")
    await vm.close()

asyncio.run(test_vector_db())
```

---

## ⚠️ Security Considerations

1. **Never commit credentials to Git**
2. **Use environment variables for all secrets**
3. **Rotate API keys regularly**
4. **Enable SSL/TLS for all external communications**
5. **Use strong, unique passwords for database access**
6. **Implement API rate limiting**
7. **Monitor API usage and costs**

---

## 📊 Cost Estimates (Monthly)

| Service | Estimated Cost | Usage |
|---------|---------------|--------|
| OpenAI API | $50-200 | Depends on LLM usage |
| VAPI | $100-500 | Based on call/SMS volume |
| Zoho CRM | $20-50/user | Standard CRM pricing |
| Database (AWS RDS) | $50-150 | t3.medium instance |
| **Total** | **$220-900** | **Varies by usage** |

---

## 🆘 Troubleshooting

### Common Issues

1. **Zoho Token Expired**
   - Regenerate refresh token
   - Check OAuth2 scopes

2. **Database Connection Failed**
   - Verify PGVector extension installed
   - Check firewall settings

3. **OpenAI Rate Limits**
   - Implement request queuing
   - Consider upgrading API tier

4. **VAPI Call Failures**
   - Verify phone number provisioning
   - Check account balance

---

## 📞 Support Contacts

- **OpenAI Support**: https://help.openai.com/
- **Zoho Support**: https://help.zoho.com/
- **VAPI Support**: https://docs.vapi.ai/
- **Database Issues**: Contact your hosting provider

---

*Last Updated: December 2024*
*Version: 1.0* 