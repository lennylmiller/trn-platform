/**
 * SSE event names used by the execution domain
 */
export const SSE_EVENTS = {
  STEP_START: 'step:start',
  STEP_OUTPUT: 'step:output',
  STEP_COMPLETE: 'step:complete',
  STEP_ERROR: 'step:error',
  STEP_PAUSED: 'step:paused',
  EXECUTION_START: 'execution:start',
  EXECUTION_COMPLETE: 'execution:complete',
  STATUS_REFRESH: 'status:refresh',
} as const;

/**
 * Step type display colors for UI
 */
export const STEP_TYPE_COLORS: Record<string, string> = {
  shell: '#2196f3',
  sql: '#ff9800',
  manual: '#9c27b0',
};

/**
 * Step category labels for UI
 */
export const STEP_CATEGORY_LABELS: Record<string, string> = {
  setup: 'Setup',
  scenario: 'Scenario',
  sync: 'Sync',
  verify: 'Verify',
  utility: 'Utility',
};

/**
 * Step story labels for UI — groups steps by narrative
 */
export const STEP_STORY_LABELS: Record<string, string> = {
  garcia: 'Garcia Family',
  miller: 'Miller Family',
};

/**
 * Composition kind labels for UI
 */
export const COMPOSITION_KIND_LABELS: Record<string, string> = {
  story: 'Story',
  tutorial: 'Tutorial',
  module: 'Module',
};

/**
 * Block type labels for UI
 */
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  narrative: 'Narrative',
  flow: 'Flow',
  note: 'Note',
  composition: 'Composition',
};
