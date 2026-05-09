/**
 * Pre-computed schema summaries for common QC course topics.
 * Injected into the system prompt based on course category/description,
 * so the AI doesn't need to call explore_schema.
 */

export interface SchemaSnapshot {
  topic: string;
  tables: {
    name: string;
    pk: string;
    keyColumns: string;
    joins?: string;
  }[];
  guardClauses?: string[];
  trainingData?: string[];
}

/**
 * Match keywords in course title/description to relevant schema snapshots.
 */
export function getRelevantSchemas(title: string, description?: string | null, category?: string | null): SchemaSnapshot[] {
  const text = `${title} ${description ?? ''} ${category ?? ''}`.toLowerCase();
  const matched: SchemaSnapshot[] = [];

  for (const [keywords, snapshot] of SCHEMA_MAP) {
    if (keywords.some((k) => text.includes(k))) {
      matched.push(snapshot);
    }
  }

  // Always include the base snapshot if nothing specific matched
  if (matched.length === 0) matched.push(BASE_SCHEMA);

  return matched;
}

/**
 * Format schema snapshots as markdown for the system prompt.
 */
export function formatSchemaContext(snapshots: SchemaSnapshot[]): string {
  const sections: string[] = ['### Pre-loaded Schema (no need to call explore_schema for these tables)\n'];

  for (const snap of snapshots) {
    sections.push(`**${snap.topic}:**\n`);
    sections.push('| Table | PK | Key Columns |');
    sections.push('|---|---|---|');
    for (const t of snap.tables) {
      sections.push(`| ${t.name} | ${t.pk} | ${t.keyColumns} |`);
    }

    if (snap.guardClauses && snap.guardClauses.length > 0) {
      sections.push('\nGuard clauses:');
      for (const g of snap.guardClauses) {
        sections.push(`- ${g}`);
      }
    }

    if (snap.trainingData && snap.trainingData.length > 0) {
      sections.push('\nTraining data:');
      for (const d of snap.trainingData) {
        sections.push(`- ${d}`);
      }
    }
    sections.push('');
  }

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Schema Snapshots
// ---------------------------------------------------------------------------

const BASE_SCHEMA: SchemaSnapshot = {
  topic: 'QC Core Basics',
  tables: [
    { name: 'member', pk: 'member_id', keyColumns: 'active, birth_date' },
    { name: 'member_name', pk: 'member_name_id', keyColumns: 'member_id FK, name_first, name_last, is_primary' },
    { name: 'client', pk: 'client_id', keyColumns: 'effective_from, effective_thru, active' },
    { name: 'client_name', pk: 'client_name_id', keyColumns: 'client_id FK, client_ud, client_nm, primary_name' },
  ],
  guardClauses: [
    'member_name: is_primary = 1 (one display name per member)',
    'client_name: primary_name = 1',
  ],
};

const CLAIMS_SCHEMA: SchemaSnapshot = {
  topic: 'Claims & Adjudication',
  tables: [
    { name: 'claim', pk: 'claim_id', keyColumns: 'claim_ud, adjudication_status_id FK, claim_form_type_id FK, received_date', joins: 'member via family_eligibility_member_benefit_plan_id' },
    { name: 'claim_procedure', pk: 'claim_procedure_id', keyColumns: 'claim_id FK, procedure_code_ud, charge, service_from_date, is_system_generated, claim_payment_run_id FK' },
    { name: 'adjudication_result_amount', pk: 'adjudication_result_amount_id', keyColumns: 'claim_procedure_id FK, contract_amount, copay_amount, deductible_amount, coinsurance_amount, net_payment, write_off_amount, member_expense_amount' },
    { name: 'adjudication_status', pk: 'adjudication_status_id', keyColumns: 'adjudication_status_ud, golden_key (APPROVED, DENIED, PEND, CLOSED)' },
    { name: 'claim_form_type', pk: 'claim_form_type_id', keyColumns: 'claim_form_type_ud (Professional, Institutional, Dental)' },
    { name: 'claim_payment_run', pk: 'claim_payment_run_id', keyColumns: 'claim_payment_run_ud, start_time (= date paid)' },
  ],
  guardClauses: [
    'claim_procedure: is_system_generated = 0 AND charge > 0 (real billable services only)',
    'adjudication_status: golden_key = \'APPROVED\' (approved claims only)',
  ],
  trainingData: [
    'TRAIN-CLM-001: Maria Garcia\'s claim, 2 procedures (99201 office visit $300, 73560 knee X-ray $150)',
    'Adjudication: $199.50 + $118.75 = $318.25 net to Dr. Park, $46.75 Maria owes',
    'TRAIN-PAYRUN-001: payment run for TRAIN-CLM-001',
  ],
};

const ENROLLMENT_SCHEMA: SchemaSnapshot = {
  topic: 'Member Enrollment',
  tables: [
    { name: 'family_eligibility', pk: 'family_eligibility_id', keyColumns: 'benefit_contract_id FK' },
    { name: 'family_eligibility_member', pk: 'family_eligibility_member_id', keyColumns: 'family_eligibility_id FK, member_id FK, relationship_to_insured_id FK' },
    { name: 'family_eligibility_member_benefit_plan', pk: 'family_eligibility_member_benefit_plan_id', keyColumns: 'family_eligibility_member_id FK, benefit_plan_id FK, effective_from, effective_thru (NULL=active)' },
    { name: 'relationship_to_insured', pk: 'relationship_to_insured_id', keyColumns: 'relationship_to_insured_ud (Self, Spouse, Child)' },
    { name: 'member', pk: 'member_id', keyColumns: 'birth_date, active' },
    { name: 'member_name', pk: 'member_name_id', keyColumns: 'member_id FK, name_first, name_last, is_primary' },
  ],
  guardClauses: [
    'member_name: is_primary = 1',
    'fembp: effective_thru IS NULL (currently active)',
  ],
  trainingData: [
    'Garcia-TRAIN family: Maria (Self), Carlos (Spouse), Sofia (Child)',
    'Enrolled in TRAIN_HMO_GOLD via TRAIN_ACME_2026 contract',
  ],
};

const BENEFIT_SCHEMA: SchemaSnapshot = {
  topic: 'Benefit Administration',
  tables: [
    { name: 'client', pk: 'client_id', keyColumns: 'effective_from, active' },
    { name: 'client_name', pk: 'client_name_id', keyColumns: 'client_id FK, client_ud, client_nm, primary_name' },
    { name: 'client_group', pk: 'client_group_id', keyColumns: 'client_id FK, effective_from, active' },
    { name: 'client_group_name', pk: 'client_group_name_id', keyColumns: 'client_group_id FK, client_group_ud, client_group_nm, primary_name' },
    { name: 'benefit_contract', pk: 'benefit_contract_id', keyColumns: 'benefit_contract_ud, client_group_id FK, effective_from' },
    { name: 'benefit_contract_period', pk: 'benefit_contract_period_id', keyColumns: 'benefit_contract_id FK, effective_from, effective_thru' },
    { name: 'benefit_plan', pk: 'benefit_plan_id', keyColumns: 'benefit_plan_ud, benefit_framework_id FK, primary_care_provider' },
    { name: 'benefit_framework', pk: 'benefit_framework_id', keyColumns: 'benefit_framework_ud, benefit_framework_nm' },
    { name: 'benefit_contract_period_benefit_plan', pk: 'benefit_contract_period_benefit_plan_id', keyColumns: 'benefit_contract_period_id FK, benefit_plan_id FK, principle_plan' },
  ],
  guardClauses: [
    'client_name: primary_name = 1',
    'client_group_name: primary_name = 1',
  ],
  trainingData: [
    'TRAIN_VERDA: Verda Health Plan (TPA/client)',
    'TRAIN_ACME: Acme Manufacturing (employer group)',
    'TRAIN_ACME_2026: benefit contract, period Jan-Dec 2026',
    'TRAIN_HMO_GOLD: benefit framework + plan, PCP required',
  ],
};

const PROVIDER_SCHEMA: SchemaSnapshot = {
  topic: 'Provider Network',
  tables: [
    { name: 'provider', pk: 'provider_id', keyColumns: 'active' },
    { name: 'provider_name', pk: 'provider_name_id', keyColumns: 'provider_id FK, name_first, name_last, is_primary' },
    { name: 'provider_identifier', pk: 'provider_identifier_id', keyColumns: 'provider_id FK, provider_ud (VIC40001), provider_identifier_type_id FK' },
    { name: 'provider_provider_network', pk: 'provider_provider_network_id', keyColumns: 'provider_id FK, provider_network_id FK' },
    { name: 'family_eligibility_member_benefit_plan_provider', pk: 'fembpp_id', keyColumns: 'family_eligibility_member_benefit_plan_id FK, provider_id FK, provider_identifier_id FK, effective_from, effective_thru' },
  ],
  guardClauses: [
    'provider_name: is_primary = 1',
    'IPA prefix: LEFT(provider_ud, 3) identifies the IPA (VIC=Vicare, GEN=Genesis)',
  ],
  trainingData: [
    'Dr. Rodriguez-TRAIN: PCP, VIC40001 (Vicare IPA)',
    'Dr. Park-TRAIN: specialist orthopedist',
  ],
};

const REFERRAL_SCHEMA: SchemaSnapshot = {
  topic: 'Referrals & Authorizations',
  tables: [
    { name: 'referral', pk: 'referral_id', keyColumns: 'referral_ud, referral_status_id FK, referring_provider_id FK, maximum_visits, effective_from, effective_thru, family_eligibility_member_benefit_plan_id FK' },
    { name: 'referral_provider', pk: 'referral_provider_id', keyColumns: 'referral_id FK, provider_id FK' },
    { name: 'referral_authorized_procedure', pk: 'referral_authorized_procedure_id', keyColumns: 'referral_id FK, procedure_code_ud' },
    { name: 'referral_status', pk: 'referral_status_id', keyColumns: 'referral_status_ud (Pending, Approved, Denied, Closed, Voided)' },
  ],
  trainingData: [
    'TRAIN-REF-001: Maria\'s referral to Dr. Park, 3 visits, 90 days',
  ],
};

const PAYMENT_SCHEMA: SchemaSnapshot = {
  topic: 'Payments & Accounting',
  tables: [
    { name: 'claim_payment_run', pk: 'claim_payment_run_id', keyColumns: 'claim_payment_run_ud, start_time (= date paid)' },
    { name: 'accounting_transaction_ap', pk: 'accounting_transaction_ap_id', keyColumns: 'accounting_transaction_ap_type_id FK, amount' },
    { name: 'accounting_transaction_ap_claim_detail', pk: 'ap_claim_detail_id', keyColumns: 'accounting_transaction_ap_id FK, claim_procedure_id FK' },
    { name: 'accounting_transaction_ap_payment_detail', pk: 'ap_payment_detail_id', keyColumns: 'accounting_transaction_ap_id FK, check_date' },
  ],
  guardClauses: [
    'Date paid = claim_payment_run.start_time (not end_time)',
    'Credit handling: when golden_key = \'CREDIT\', reverse sign: -1 * ABS(amount)',
  ],
  trainingData: [
    'TRAIN-PAYRUN-001: payment for TRAIN-CLM-001, $318.25 to Dr. Park',
  ],
};

// ---------------------------------------------------------------------------
// Keyword → Schema mapping
// ---------------------------------------------------------------------------

const SCHEMA_MAP: [string[], SchemaSnapshot][] = [
  [['claim', 'adjudicat', 'adjudication'], CLAIMS_SCHEMA],
  [['enroll', 'eligib', 'family_eligibility', 'fembp', 'member'], ENROLLMENT_SCHEMA],
  [['benefit', 'contract', 'plan', 'framework', 'client', 'group'], BENEFIT_SCHEMA],
  [['provider', 'network', 'ipa', 'pcp', 'doctor'], PROVIDER_SCHEMA],
  [['referral', 'authoriz'], REFERRAL_SCHEMA],
  [['payment', 'accounting', 'payrun', 'billing'], PAYMENT_SCHEMA],
];
