# AIS Services Troubleshooting Plan

## Context
AIS services on BEAST are not working. The logs in `C:\logs\` are freshly initialized (today, all clean — only init messages, no errors). We need a systematic approach: Lenny manually exercises each service while I watch the logs for errors in real-time.

## Phase 1: Set Up Log Monitoring

I'll start background `tail -f` watchers on all 22 `.txt` log files so I can catch errors the moment they appear. The `.svclog` files are currently empty but I'll watch those too.

```
tail -f /mnt/c/logs/QC-AIS-*Log.txt
```

## Phase 2: Systematic Service Testing

Lenny tests each service manually (via QC UI or direct AIS calls). We'll go domain-by-domain, starting with the most commonly used services. For each service:

1. Lenny triggers the operation (search, add, or update)
2. I check the corresponding log file for new entries / errors
3. We document: **worked** or **failed + error details**

### Suggested Testing Order (high-value services first)

| # | Service | Action to Test | Log File |
|---|---------|---------------|----------|
| 1 | **MemberSearchRetrieve** | Search for a member | QC-AIS-MemberSearchRetrieveServiceLog.txt |
| 2 | **MemberAddUpdate** | Edit a member field | QC-AIS-MemberAddUpdateServiceLog.txt |
| 3 | **ClaimSearchRetrieve** | Search for a claim | QC-AIS-ClaimSearchRetrieveServiceLog.txt |
| 4 | **ClaimAddUpdate** | Edit/submit a claim | QC-AIS-ClaimAddUpdateServiceLog.txt |
| 5 | **ProviderSearchRetrieve** | Search for a provider | QC-AIS-ProviderSearchRetrieveServiceLog.txt |
| 6 | **ProviderAddUpdate** | Edit a provider | QC-AIS-ProviderAddUpdateServiceLog.txt |
| 7 | **CustomerSearchRetrieve** | Search for a customer/group | QC-AIS-CustomerSearchRetrieveServiceLog.txt |
| 8 | **AccountingSearchRetrieve** | Search accounting | QC-AIS-AccountingSearchRetrieveServiceLog.txt |
| 9 | **EnrollmentEligibilitySearchRetrieve** | Search enrollment | QC-AIS-EnrollmentEligibilitySearchRetrieveServiceLog.txt |
| 10 | **VendorSearchRetrieve** | Search for a vendor | QC-AIS-VendorSearchRetrieveServiceLog.txt |

We can expand to the remaining services (BenefitContract, CustomerPayment, PracticeOffice, PremiumRate, ReferralAuthorization, ClaimOperations.WebApi) after covering the core 10.

## Phase 3: Diagnose Patterns

After testing several services, we look for common patterns:
- Are ALL services failing, or only some? (points to shared config vs. service-specific issue)
- Are SearchRetrieve services failing differently than AddUpdate? (read vs. write permissions)
- What error types appear? (connection strings, auth, missing DB objects, timeout, etc.)
- Do the `.svclog` trace files get populated on failure?

## Phase 4: Targeted Fix

Based on patterns found, likely directions:
- **Connection string issue** — all services fail the same way
- **Database object missing** — specific SPROCs or tables not present on BEAST
- **Auth/permission issue** — service account can't reach SQL
- **Config mismatch** — services pointing at wrong server/DB

## How We'll Work Together

1. I start the log watchers (background tail)
2. Lenny says "testing Member Search" (or similar)
3. Lenny exercises the service in QC
4. I read the log file and report what appeared
5. We record the result and move to the next service
