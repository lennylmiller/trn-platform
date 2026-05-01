import { useCallback, useState } from 'react';
import { useExecuteSql } from '@trn-platform/execution-data-access';
import type { CourseSlide } from '@trn-platform/shared';

export interface VerifyResult {
  passed: boolean;
  message: string;
  actual?: unknown;
  expected?: unknown;
}

/**
 * Runs verification SQL for do_it_in_qc and sql_challenge slides.
 * Compares actual results against expected_json when verify_mode = 'auto'.
 */
export function useSlideVerify() {
  const executeSql = useExecuteSql();
  const [result, setResult] = useState<VerifyResult | null>(null);

  const verify = useCallback(
    (slide: CourseSlide) => {
      const sql = slide.sql_text;
      if (!sql) {
        setResult({ passed: false, message: 'No verification SQL defined for this slide.' });
        return;
      }

      executeSql.mutate(sql, {
        onSuccess: (data) => {
          if (slide.verify_mode === 'auto' && slide.expected_json) {
            const expected = slide.expected_json as Record<string, unknown>;
            const actualRowCount = data.rowCount;

            // Check row count if expected
            if (expected.row_count !== undefined) {
              const match = actualRowCount === expected.row_count;
              setResult({
                passed: match,
                message: match
                  ? `Correct! Found ${actualRowCount} row(s) as expected.`
                  : `Expected ${expected.row_count} row(s), but found ${actualRowCount}.`,
                actual: actualRowCount,
                expected: expected.row_count,
              });
              return;
            }

            // Default: just show results
            setResult({
              passed: true,
              message: `Query returned ${actualRowCount} row(s).`,
              actual: data,
            });
          } else {
            // show mode — just display results
            setResult({
              passed: true,
              message: `Query returned ${data.rowCount} row(s).`,
              actual: data,
            });
          }
        },
        onError: (err) => {
          setResult({
            passed: false,
            message: `Verification failed: ${err.message}`,
          });
        },
      });
    },
    [executeSql],
  );

  const clearResult = useCallback(() => setResult(null), []);

  return {
    verify,
    result,
    clearResult,
    isPending: executeSql.isPending,
  };
}
