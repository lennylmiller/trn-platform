import { http, HttpResponse } from 'msw';
import {
  mockSteps,
  mockStepListItems,
  mockFlowListItems,
  mockFlowDetail,
  mockCompositionListItems,
  mockCompositionDetails,
  mockTrainingStatus,
  mockSqlResult,
} from './mockData';

const API_BASE = 'http://localhost:3001/api/v2';

export const handlers = [
  // ========================================================================
  // STEPS
  // ========================================================================

  /** GET /api/v2/steps — list all steps (light) */
  http.get(`${API_BASE}/steps`, () => {
    return HttpResponse.json(mockStepListItems);
  }),

  /** GET /api/v2/steps/:id — single step detail */
  http.get(`${API_BASE}/steps/:id`, ({ params }) => {
    const step = mockSteps.find((s) => s.step_id === Number(params.id));
    if (!step) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(step);
  }),

  /** POST /api/v2/steps — create step */
  http.post(`${API_BASE}/steps`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ step_id: 100, ...body, is_seed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  /** PUT /api/v2/steps/:id — update step */
  http.put(`${API_BASE}/steps/:id`, async ({ params, request }) => {
    const step = mockSteps.find((s) => s.step_id === Number(params.id));
    if (!step) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...step, ...body, updated_at: new Date().toISOString() });
  }),

  /** DELETE /api/v2/steps/:id — delete step */
  http.delete(`${API_BASE}/steps/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ========================================================================
  // FLOWS
  // ========================================================================

  /** GET /api/v2/flows — list flows */
  http.get(`${API_BASE}/flows`, () => {
    return HttpResponse.json(mockFlowListItems);
  }),

  /** GET /api/v2/flows/:id — flow detail with steps */
  http.get(`${API_BASE}/flows/:id`, ({ params }) => {
    if (Number(params.id) === mockFlowDetail.flow_id) {
      return HttpResponse.json(mockFlowDetail);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  /** POST /api/v2/flows — create flow */
  http.post(`${API_BASE}/flows`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ flow_id: 100, ...body, is_seed: false, step_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  /** PUT /api/v2/flows/:id — update flow */
  http.put(`${API_BASE}/flows/:id`, async ({ params, request }) => {
    const flow = mockFlowListItems.find((f) => f.flow_id === Number(params.id));
    if (!flow) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...flow, ...body, updated_at: new Date().toISOString() });
  }),

  /** DELETE /api/v2/flows/:id — delete flow */
  http.delete(`${API_BASE}/flows/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  /** PUT /api/v2/flows/:id/steps — replace all flow steps */
  http.put(`${API_BASE}/flows/:id/steps`, async ({ request }) => {
    const body = (await request.json()) as unknown[];
    return HttpResponse.json(body);
  }),

  /** POST /api/v2/flows/:id/steps — add step to flow */
  http.post(`${API_BASE}/flows/:id/steps`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ flow_step_id: 100, ...body }, { status: 201 });
  }),

  /** PUT /api/v2/flows/:id/steps/:stepId — update flow step */
  http.put(`${API_BASE}/flows/:id/steps/:stepId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ flow_step_id: Number(params.stepId), ...body });
  }),

  /** DELETE /api/v2/flows/:id/steps/:stepId — remove flow step */
  http.delete(`${API_BASE}/flows/:id/steps/:stepId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ========================================================================
  // COMPOSITIONS
  // ========================================================================

  /** GET /api/v2/compositions — list compositions */
  http.get(`${API_BASE}/compositions`, () => {
    return HttpResponse.json(mockCompositionListItems);
  }),

  /** GET /api/v2/compositions/:id — composition detail with blocks */
  http.get(`${API_BASE}/compositions/:id`, ({ params }) => {
    const detail = mockCompositionDetails[Number(params.id)];
    if (detail) return HttpResponse.json(detail);
    return new HttpResponse(null, { status: 404 });
  }),

  /** POST /api/v2/compositions — create composition */
  http.post(`${API_BASE}/compositions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ composition_id: 100, ...body, is_seed: false, block_count: 0, flow_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  /** PUT /api/v2/compositions/:id — update composition */
  http.put(`${API_BASE}/compositions/:id`, async ({ params, request }) => {
    const comp = mockCompositionListItems.find((c) => c.composition_id === Number(params.id));
    if (!comp) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...comp, ...body, updated_at: new Date().toISOString() });
  }),

  /** DELETE /api/v2/compositions/:id — delete composition */
  http.delete(`${API_BASE}/compositions/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  /** PUT /api/v2/compositions/:id/blocks — replace all blocks */
  http.put(`${API_BASE}/compositions/:id/blocks`, async ({ request }) => {
    const body = (await request.json()) as unknown;
    return HttpResponse.json(body);
  }),

  /** POST /api/v2/compositions/:id/blocks — add block */
  http.post(`${API_BASE}/compositions/:id/blocks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ block_id: 100, ...body }, { status: 201 });
  }),

  /** PUT /api/v2/compositions/:id/blocks/:blockId — update block */
  http.put(`${API_BASE}/compositions/:id/blocks/:blockId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ block_id: Number(params.blockId), ...body });
  }),

  /** DELETE /api/v2/compositions/:id/blocks/:blockId — remove block */
  http.delete(`${API_BASE}/compositions/:id/blocks/:blockId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ========================================================================
  // EXECUTION
  // ========================================================================

  /** GET /api/v2/execute/status — training status */
  http.get(`${API_BASE}/execute/status`, () => {
    return HttpResponse.json(mockTrainingStatus);
  }),

  /** POST /api/v2/execute/sql — ad-hoc SQL */
  http.post(`${API_BASE}/execute/sql`, () => {
    return HttpResponse.json(mockSqlResult);
  }),

  /** POST /api/v2/execute/step/:stepId — execute single step */
  http.post(`${API_BASE}/execute/step/:stepId`, ({ params }) => {
    return HttpResponse.json({ executionId: 'exec-mock-001', stepId: Number(params.stepId), type: 'shell' });
  }),

  /** POST /api/v2/execute/flow/:flowId — execute flow */
  http.post(`${API_BASE}/execute/flow/:flowId`, ({ params }) => {
    return HttpResponse.json({ executionId: 'exec-mock-001', flowId: Number(params.flowId), flowName: 'Mock Flow', totalSteps: 3 });
  }),

  /** POST /api/v2/execute/resume — resume paused execution */
  http.post(`${API_BASE}/execute/resume`, () => {
    return HttpResponse.json({ resumed: true });
  }),

  /** POST /api/v2/execute/abort — abort execution */
  http.post(`${API_BASE}/execute/abort`, () => {
    return HttpResponse.json({ aborted: true });
  }),
];
