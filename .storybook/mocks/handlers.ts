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
  mockStories,
  mockStoryDetails,
  mockStoryPlanItems,
  mockCourseListItems,
  mockCourseDetails,
  mockCourseSeries,
  mockCourseTracks,
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

  // ========================================================================
  // STORIES
  // ========================================================================

  /** GET /api/v2/stories — list stories */
  http.get(`${API_BASE}/stories`, () => {
    return HttpResponse.json(mockStories);
  }),

  /** GET /api/v2/stories/:id — story detail with plan items */
  http.get(`${API_BASE}/stories/:id`, ({ params }) => {
    const detail = mockStoryDetails[Number(params.id)];
    if (detail) return HttpResponse.json(detail);
    return new HttpResponse(null, { status: 404 });
  }),

  /** POST /api/v2/stories — create story */
  http.post(`${API_BASE}/stories`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        story_id: 100,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...body,
      },
      { status: 201 },
    );
  }),

  /** PUT /api/v2/stories/:id — update story */
  http.put(`${API_BASE}/stories/:id`, async ({ params, request }) => {
    const detail = mockStoryDetails[Number(params.id)];
    if (!detail) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...detail, ...body, updated_at: new Date().toISOString() });
  }),

  /** POST /api/v2/stories/:id/plan — add plan items */
  http.post(`${API_BASE}/stories/:id/plan`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>[];
    const storyId = Number(params.id);
    return HttpResponse.json(
      body.map((item, index) => ({
        plan_item_id: 100 + index,
        story_id: storyId,
        status: 'pending',
        step_id: null,
        tables_involved: null,
        created_at: new Date().toISOString(),
        updated_at: null,
        ...item,
      })),
      { status: 201 },
    );
  }),

  /** PUT /api/v2/stories/:id/plan/:itemId — update plan item */
  http.put(`${API_BASE}/stories/:id/plan/:itemId`, async ({ params, request }) => {
    const item = mockStoryPlanItems.find((p) => p.plan_item_id === Number(params.itemId));
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...item, ...body, updated_at: new Date().toISOString() });
  }),

  // ========================================================================
  // COURSES
  // ========================================================================

  /** GET /api/v2/courses — list courses */
  http.get(`${API_BASE}/courses`, () => {
    return HttpResponse.json(mockCourseListItems);
  }),

  /** GET /api/v2/courses/tracks — list tracks */
  http.get(`${API_BASE}/courses/tracks`, () => {
    return HttpResponse.json(mockCourseTracks);
  }),

  /** GET /api/v2/courses/series — list series */
  http.get(`${API_BASE}/courses/series`, () => {
    return HttpResponse.json(mockCourseSeries);
  }),

  /** GET /api/v2/courses/:id — course detail with lessons and slides */
  http.get(`${API_BASE}/courses/:id`, ({ params }) => {
    const detail = mockCourseDetails[Number(params.id)];
    if (detail) return HttpResponse.json(detail);
    return new HttpResponse(null, { status: 404 });
  }),

  /** POST /api/v2/courses — create course */
  http.post(`${API_BASE}/courses`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        course_id: 100,
        status: 'draft',
        cover_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...body,
      },
      { status: 201 },
    );
  }),

  /** POST /api/v2/courses/:id/lessons — add lesson */
  http.post(`${API_BASE}/courses/:id/lessons`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        lesson_id: 100,
        course_id: Number(params.id),
        description: null,
        ...body,
      },
      { status: 201 },
    );
  }),

  /** POST /api/v2/courses/:id/lessons/:lessonId/slides — add slide */
  http.post(`${API_BASE}/courses/:id/lessons/:lessonId/slides`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        slide_id: 100,
        lesson_id: Number(params.lessonId),
        created_at: new Date().toISOString(),
        ...body,
      },
      { status: 201 },
    );
  }),

  /** PUT /api/v2/courses/:id/lessons/:lessonId/slides/:slId — update slide */
  http.put(`${API_BASE}/courses/:id/lessons/:lessonId/slides/:slId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      slide_id: Number(params.slId),
      lesson_id: Number(params.lessonId),
      seq: 0,
      slide_type: 'narrative',
      ...body,
    });
  }),

  /** DELETE /api/v2/courses/:id/lessons/:lessonId — delete lesson */
  http.delete(`${API_BASE}/courses/:id/lessons/:lessonId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  /** DELETE /api/v2/courses/:id/lessons/:lessonId/slides/:slId — delete slide */
  http.delete(`${API_BASE}/courses/:id/lessons/:lessonId/slides/:slId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  /** POST /api/v2/courses/:id/clear — clear course */
  http.post(`${API_BASE}/courses/:id/clear`, ({ params }) => {
    return HttpResponse.json({ message: 'Course cleared', course_id: Number(params.id) });
  }),

  // ========================================================================
  // CHAT
  // ========================================================================

  /** POST /api/v2/chat — mock assistant response */
  http.post(`${API_BASE}/chat`, async ({ request }) => {
    const body = (await request.json()) as { systemPromptHint?: string };
    const courseMode = body.systemPromptHint?.startsWith('course-authoring');
    return HttpResponse.json({
      response: courseMode
        ? 'I drafted the next lesson outline and can create the slides after you approve the structure.'
        : 'I checked the schema and found the relevant training tables for this workflow.',
      toolCalls: courseMode
        ? [
            {
              tool: 'get_course',
              input: { courseId: 42 },
              result: JSON.stringify(mockCourseDetails[42], null, 2),
            },
          ]
        : [
            {
              tool: 'explore_schema',
              input: { table: 'family_eligibility' },
              result: 'family_eligibility, family_eligibility_member, and family_eligibility_member_benefit_plan are available.',
            },
          ],
    });
  }),
];
