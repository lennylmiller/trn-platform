Build out this course on Claims Adjudication using the Borgia-TRAIN training family. Create comprehensive training data for the Borgia family members with realistic healthcare scenarios.

**Course: Claims Adjudication Fundamentals**
**Training Family:** Borgia-TRAIN

**Lesson 1: Understanding Claims Basics**
- Tables: claim, member, member_name, provider, provider_name
- Blocks: narrative (what is a claim, key stakeholders), live_demo (SELECT claim.claim_id, claim.claim_ud, member_name.first_name, member_name.last_name FROM claim JOIN member ON claim.member_id = member.member_id JOIN member_name ON member.member_id = member_name.member_id WHERE member_name.is_primary = 1 AND member_name.last_name LIKE '%Borgia-TRAIN%'), quiz (claim components and stakeholders)

**Lesson 2: Claim Procedures and Services**
- Tables: claim_procedure, provider, provider_name
- Blocks: narrative (procedure codes, service lines, provider roles), live_demo (SELECT cp.procedure_code, cp.charge, cp.units, pn.organization_name FROM claim_procedure cp JOIN claim c ON cp.claim_id = c.claim_id JOIN provider p ON c.billing_provider_id = p.provider_id JOIN provider_name pn ON p.provider_id = pn.provider_id WHERE c.claim_ud LIKE '%BORGIA-TRAIN%' AND cp.is_system_generated = 0 AND cp.charge > 0), quiz (procedure code types and billing concepts)

**Lesson 3: Adjudication Process Overview**
- Tables: adjudication_status, claim
- Blocks: narrative (adjudication lifecycle, status transitions, business rules), live_demo (SELECT c.claim_ud, as1.status_description, as1.status_date FROM claim c JOIN adjudication_status as1 ON c.claim_id = as1.claim_id WHERE c.claim_ud LIKE '%BORGIA-TRAIN%' ORDER BY as1.status_date), quiz (adjudication stages and decision points)

**Lesson 4: Financial Adjudication Results**
- Tables: adjudication_result_amount, claim_procedure, claim
- Blocks: narrative (payment calculations, deductibles, copays, network adjustments), live_demo (SELECT cp.procedure_code, cp.charge, ara.allowed_amount, ara.copay_amount, ara.deductible_amount, ara.paid_amount FROM adjudication_result_amount ara JOIN claim_procedure cp ON ara.claim_procedure_id = cp.claim_procedure_id JOIN claim c ON cp.claim_id = c.claim_id WHERE c.claim_ud LIKE '%BORGIA-TRAIN%' AND cp.is_system_generated = 0), quiz (payment calculation components)

**Lesson 5: End-to-End Adjudication Workflow**
- Tables: claim, claim_procedure, adjudication_status, adjudication_result_amount, member, provider
- Blocks: narrative (complete workflow integration), sql_challenge (write query to show full adjudication trail for a Borgia-TRAIN claim including member, provider, procedures, status history, and financial results), do_it_in_qc (investigate a complex Borgia-TRAIN claim with multiple procedures and explain the adjudication decisions)

Create realistic scenarios including: routine office visits, specialist referrals, emergency services, and pharmacy claims. Include edge cases like prior authorization requirements, network vs out-of-network providers, and benefit plan limitations. Ensure all Borgia-TRAIN data demonstrates both approved and denied claims with clear business reasoning.

Building...

