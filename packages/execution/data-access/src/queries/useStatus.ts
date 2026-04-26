import { useQuery } from '@tanstack/react-query';
import { TrainingStatusSchema } from '@trn-platform/shared';
import type { TrainingStatus } from '@trn-platform/shared';
import { apiFetch } from '../client';
import { executionKeys } from '../keys';

/**
 * Fetch training status from qc_core — checks key tables for data presence.
 */
export function useStatus() {
  return useQuery<TrainingStatus>({
    queryKey: executionKeys.status(),
    queryFn: async () => {
      const data = await apiFetch<TrainingStatus>('/api/v2/execute/status');
      return TrainingStatusSchema.parse(data);
    },
  });
}
