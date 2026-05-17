import { http, HttpResponse } from 'msw';
import {
  mockSqlResult,
  mockCourseListItems,
  mockCourseDetails,
  mockCourseSeries,
  mockCourseTracks,
} from './mockData';

const API_BASE = 'http://localhost:3001/api/v2';

export const handlers = [
  // ========================================================================
  // SQL EXECUTION (used by course SQL challenge blocks)
  // ========================================================================

  /** POST /api/v2/execute/sql — ad-hoc SQL */
  http.post(`${API_BASE}/execute/sql`, () => {
    return HttpResponse.json(mockSqlResult);
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
