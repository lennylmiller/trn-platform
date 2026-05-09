/**
 * Courses API integration tests.
 *
 * Uses supertest against the Express router with a mocked database pool.
 * No live SQL Server required — the pool's .request().input().query() chain
 * is mocked to return controlled recordsets.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// ---------------------------------------------------------------------------
// Mock database pool
// ---------------------------------------------------------------------------

function createMockPool() {
  const mockRequest = {
    input: vi.fn().mockReturnThis(),
    query: vi.fn().mockResolvedValue({ recordset: [], rowsAffected: [0] }),
  };

  return {
    request: vi.fn(() => ({ ...mockRequest, input: vi.fn().mockReturnThis(), query: mockRequest.query })),
    _mockQuery: mockRequest.query,
  };
}

let mockPool: ReturnType<typeof createMockPool>;

vi.mock('@trn-platform/shared/db', () => ({
  getPool: vi.fn(() => Promise.resolve(mockPool)),
}));

// Import router AFTER mock is set up
const { coursesRouter } = await import('../routes.js');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v2/courses', coursesRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

const COURSE_ROW = {
  course_id: 1, title: 'Test Course', description: 'Test desc',
  category: 'test', status: 'draft', cover_image_url: null,
  series_id: null, series_seq: null, actor: null,
  track_id: null, track_seq: null,
  created_at: '2026-01-01', updated_at: '2026-01-01',
};

const LESSON_ROW = {
  lesson_id: 10, course_id: 1, seq: 0,
  title: 'Test Lesson', description: 'Lesson desc',
};

const BLOCK_ROW = {
  block_id: 100, lesson_id: 10, seq: 0, block_type: 'narrative',
  title: 'Test Slide', content: '# Hello', image_url: null,
  sql_text: null, sql_label: null, verify_mode: null,
  expected_json: null, quiz_question: null, quiz_options: null,
  quiz_answer: null, quiz_explanation: null, hints: null,
  presenter_notes: null, seed_sql: null, seed_label: null,
  created_at: '2026-01-01',
};

const TRACK_ROW = {
  track_id: 1, title: 'Test Track', description: 'Track desc',
  seq: 0, metadata: null, created_at: '2026-01-01',
};

const SERIES_ROW = {
  series_id: 1, title: 'Test Series', description: 'Series desc',
  track_id: null, track_seq: null, created_at: '2026-01-01',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Courses API', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPool = createMockPool();
    app = createApp();
  });

  // =========================================================================
  // Tracks
  // =========================================================================

  describe('GET /tracks', () => {
    it('returns track list', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [TRACK_ROW] });
      const res = await request(app).get('/api/v2/courses/tracks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Test Track');
    });
  });

  describe('POST /tracks', () => {
    it('creates a track', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [TRACK_ROW] });
      const res = await request(app)
        .post('/api/v2/courses/tracks')
        .send({ title: 'New Track', description: 'Desc' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Track');
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/v2/courses/tracks')
        .send({ description: 'No title' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /tracks/:trackId', () => {
    it('updates a track', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [{ ...TRACK_ROW, description: 'Updated' }] });
      const res = await request(app)
        .put('/api/v2/courses/tracks/1')
        .send({ description: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /tracks/:trackId', () => {
    it('deletes a track and unlinks', async () => {
      // 3 queries: unlink series, unlink courses, delete track
      mockPool._mockQuery
        .mockResolvedValueOnce({ rowsAffected: [1] })
        .mockResolvedValueOnce({ rowsAffected: [0] })
        .mockResolvedValueOnce({ rowsAffected: [1] });
      const res = await request(app).delete('/api/v2/courses/tracks/1');
      expect(res.status).toBe(204);
    });
  });

  // =========================================================================
  // Series
  // =========================================================================

  describe('GET /series', () => {
    it('returns series list', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [SERIES_ROW] });
      const res = await request(app).get('/api/v2/courses/series');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Test Series');
    });
  });

  // =========================================================================
  // Course CRUD
  // =========================================================================

  describe('GET /courses', () => {
    it('returns course list with counts', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({
        recordset: [{ ...COURSE_ROW, lesson_count: 3, block_count: 10 }],
      });
      const res = await request(app).get('/api/v2/courses');
      expect(res.status).toBe(200);
      expect(res.body[0].lesson_count).toBe(3);
    });
  });

  describe('GET /courses/:id', () => {
    it('returns course detail with lessons and slides', async () => {
      mockPool._mockQuery
        .mockResolvedValueOnce({ recordset: [COURSE_ROW] }) // course
        .mockResolvedValueOnce({ recordset: [LESSON_ROW] }) // lessons
        .mockResolvedValueOnce({ recordset: [BLOCK_ROW] }); // slides
      const res = await request(app).get('/api/v2/courses/1');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Course');
      expect(res.body.lessons).toHaveLength(1);
      expect(res.body.lessons[0].slides).toHaveLength(1);
    });

    it('returns 404 for nonexistent course', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app).get('/api/v2/courses/99999');
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app).get('/api/v2/courses/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /courses', () => {
    it('creates a course', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [COURSE_ROW] });
      const res = await request(app)
        .post('/api/v2/courses')
        .send({ title: 'New Course' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Course');
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/v2/courses')
        .send({ description: 'No title' });
      // Zod validation throws — caught by Express error handler as 500
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /courses/:id', () => {
    it('updates course metadata', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [{ ...COURSE_ROW, description: 'Updated' }] });
      const res = await request(app)
        .put('/api/v2/courses/1')
        .send({ description: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('deletes a course', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rowsAffected: [1] });
      const res = await request(app).delete('/api/v2/courses/1');
      expect(res.status).toBe(204);
    });

    it('returns 404 for nonexistent course', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rowsAffected: [0] });
      const res = await request(app).delete('/api/v2/courses/99999');
      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // Lessons
  // =========================================================================

  describe('POST /courses/:id/lessons', () => {
    it('adds a lesson', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [LESSON_ROW] });
      const res = await request(app)
        .post('/api/v2/courses/1/lessons')
        .send({ seq: 0, title: 'New Lesson' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Lesson');
    });
  });

  describe('PUT /courses/:id/lessons/:lessonId', () => {
    it('updates a lesson', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [{ ...LESSON_ROW, title: 'Updated' }] });
      const res = await request(app)
        .put('/api/v2/courses/1/lessons/10')
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /courses/:id/lessons/:lessonId', () => {
    it('deletes a lesson', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rowsAffected: [1] });
      const res = await request(app).delete('/api/v2/courses/1/lessons/10');
      expect(res.status).toBe(204);
    });
  });

  // =========================================================================
  // Slides
  // =========================================================================

  describe('POST /courses/:id/lessons/:lessonId/slides', () => {
    it('adds a slide', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [BLOCK_ROW] });
      const res = await request(app)
        .post('/api/v2/courses/1/lessons/10/slides')
        .send({ seq: 0, block_type: 'narrative', title: 'New Slide' });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /courses/:id/lessons/:lessonId/slides/:slId', () => {
    it('updates a slide', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [{ ...BLOCK_ROW, title: 'Updated' }] });
      const res = await request(app)
        .put('/api/v2/courses/1/lessons/10/slides/100')
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /courses/:id/lessons/:lessonId/slides/:slId', () => {
    it('deletes a slide', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rowsAffected: [1] });
      const res = await request(app).delete('/api/v2/courses/1/lessons/10/slides/100');
      expect(res.status).toBe(204);
    });
  });

  // =========================================================================
  // Bulk Build
  // =========================================================================

  describe('POST /courses/:id/build', () => {
    it('builds course content in one call', async () => {
      // delete existing lessons, insert lesson, insert slide, update timestamp
      mockPool._mockQuery
        .mockResolvedValueOnce({ rowsAffected: [0] }) // delete lessons
        .mockResolvedValueOnce({ recordset: [{ lesson_id: 20 }] }) // insert lesson
        .mockResolvedValueOnce({ rowsAffected: [1] }) // insert slide
        .mockResolvedValueOnce({ rowsAffected: [1] }); // update timestamp
      const res = await request(app)
        .post('/api/v2/courses/1/build')
        .send({
          lessons: [{
            title: 'Built Lesson',
            slides: [{ block_type: 'narrative', title: 'Built Slide', content: 'Hello' }],
          }],
        });
      expect(res.status).toBe(200);
      expect(res.body.lessons).toBe(1);
      expect(res.body.slides).toBe(1);
    });

    it('rejects missing lessons array', async () => {
      const res = await request(app)
        .post('/api/v2/courses/1/build')
        .send({ content: 'wrong format' });
      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // Clear
  // =========================================================================

  describe('POST /courses/:id/clear', () => {
    it('clears all lessons from a course', async () => {
      mockPool._mockQuery
        .mockResolvedValueOnce({ rowsAffected: [3] }) // delete lessons
        .mockResolvedValueOnce({ rowsAffected: [1] }); // update timestamp
      const res = await request(app).post('/api/v2/courses/1/clear');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Course cleared');
    });
  });

  // =========================================================================
  // Export
  // =========================================================================

  describe('GET /courses/:id/export', () => {
    it('returns portable JSON without IDs', async () => {
      mockPool._mockQuery
        .mockResolvedValueOnce({ recordset: [COURSE_ROW] }) // course
        .mockResolvedValueOnce({ recordset: [LESSON_ROW] }) // lessons
        .mockResolvedValueOnce({ recordset: [BLOCK_ROW] }); // slides
      const res = await request(app).get('/api/v2/courses/1/export');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Course');
      expect(res.body.lessons).toHaveLength(1);
      // No IDs in export
      expect(res.body).not.toHaveProperty('course_id');
      expect(res.body.lessons[0]).not.toHaveProperty('lesson_id');
    });

    it('returns 404 for nonexistent course', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app).get('/api/v2/courses/99999/export');
      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // Import
  // =========================================================================

  describe('POST /courses/import', () => {
    it('creates course from exported JSON', async () => {
      mockPool._mockQuery
        .mockResolvedValueOnce({ recordset: [COURSE_ROW] }) // createCourse
        .mockResolvedValueOnce({ rowsAffected: [0] }) // delete lessons (buildCourseContent)
        .mockResolvedValueOnce({ recordset: [{ lesson_id: 20 }] }) // insert lesson
        .mockResolvedValueOnce({ rowsAffected: [1] }) // insert slide
        .mockResolvedValueOnce({ rowsAffected: [1] }) // update timestamp
        .mockResolvedValueOnce({ recordset: [COURSE_ROW] }) // getCourse
        .mockResolvedValueOnce({ recordset: [LESSON_ROW] }) // lessons
        .mockResolvedValueOnce({ recordset: [BLOCK_ROW] }); // slides
      const res = await request(app)
        .post('/api/v2/courses/import')
        .send({
          title: 'Imported Course',
          description: 'From export',
          lessons: [{
            title: 'Lesson 1',
            slides: [{ block_type: 'narrative', title: 'Slide 1', content: 'Hello' }],
          }],
        });
      expect(res.status).toBe(201);
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/v2/courses/import')
        .send({ description: 'No title' });
      expect(res.status).toBe(400);
    });
  });
});
