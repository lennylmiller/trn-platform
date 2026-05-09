/**
 * Claude Code integration — calls the `claude` CLI as a subprocess.
 *
 * Used for "Plan" mode in the AI Author: takes a rough user prompt and
 * returns a refined, structured course creation prompt.
 */
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCb);

const PLAN_SYSTEM_PROMPT = `You are a course planning assistant for the QC Training platform. The user will give you a rough idea for a training course about the QC healthcare database system.

Your job is to take their rough idea and produce a refined, structured prompt that can be sent to an AI course builder. The course builder understands these block types:
- narrative: rich markdown content teaching a concept
- live_demo: SQL query with a label that runs against qc_core
- quiz: multiple choice with 4 options, 0-based answer index, and explanation
- sql_challenge: learner writes SQL with progressive hints
- do_it_in_qc: hands-on task verified by SQL

The QC system uses these conventions:
- Training data uses _TRAIN_ suffix (e.g., Garcia-TRAIN, TRAIN_VERDA, TRAIN-CLM-001)
- Primary keys: <table>_id (e.g., member_id, claim_id)
- User display columns: _ud suffix (e.g., claim_ud)
- Guard clauses: member_name.is_primary=1, claim_procedure.is_system_generated=0 AND charge>0

Key database areas:
- Claims: claim, claim_procedure, adjudication_result_amount, adjudication_status
- Members: member, member_name, family_eligibility_member, family_eligibility_member_benefit_plan
- Benefits: client, client_group, benefit_contract, benefit_plan, benefit_framework
- Providers: provider, provider_name, provider_identifier, provider_provider_network
- Referrals: referral, referral_provider, referral_status
- Payments: claim_payment_run, accounting_transaction_ap

Output ONLY the refined prompt — no preamble, no explanation. The prompt should:
1. Start with "Build out this course..."
2. Specify the training family name with _TRAIN_ suffix
3. List each lesson with title, which tables it covers, and block types
4. Specify the rhythm: narrative → live_demo → quiz per lesson
5. Include specific SQL examples or table references
6. Be detailed enough that the course builder can create all content in one tool call`;

interface ClaudeCodeResult {
  result: string;
  duration_ms: number;
  total_cost_usd: number;
  is_error: boolean;
}

/**
 * Call Claude Code CLI to refine a rough course prompt into a structured one.
 */
export async function planWithClaudeCode(roughPrompt: string): Promise<{
  refinedPrompt: string;
  durationMs: number;
  costUsd: number;
}> {
  const fullPrompt = `${PLAN_SYSTEM_PROMPT}\n\n---\n\nUser's rough idea:\n${roughPrompt}`;

  try {
    const { stdout } = await execFile('claude', [
      '-p', fullPrompt,
      '--output-format', 'json',
    ], {
      timeout: 120_000, // 2 minute timeout
      maxBuffer: 1024 * 1024, // 1MB output buffer
      env: { ...process.env },
    });

    const parsed: ClaudeCodeResult = JSON.parse(stdout);

    if (parsed.is_error) {
      throw new Error(`Claude Code returned an error: ${parsed.result}`);
    }

    return {
      refinedPrompt: parsed.result.trim(),
      durationMs: parsed.duration_ms,
      costUsd: parsed.total_cost_usd,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('ENOENT')) {
      throw new Error('Claude Code CLI (claude) is not installed or not in PATH.');
    }
    throw err;
  }
}
