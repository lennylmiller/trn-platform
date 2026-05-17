import type { SqlResult } from '@trn-platform/shared';
import type { CourseDetail, CourseListItem, CourseSeries, CourseSlide, CourseTrack } from '@trn-platform/shared';

// ============================================================================
// EXECUTION (SQL only — used by course SQL challenge blocks)
// ============================================================================

export const mockSqlResult: SqlResult = {
  columns: ['member_id', 'first_name', 'last_name', 'status'],
  rows: [
    { member_id: 1, first_name: 'Jane', last_name: 'Doe', status: 'active' },
    { member_id: 2, first_name: 'John', last_name: 'Smith', status: 'active' },
    { member_id: 3, first_name: 'Alice', last_name: 'Johnson', status: 'inactive' },
  ],
  rowCount: 3,
};

// ============================================================================
// COURSES
// ============================================================================

export const mockCourseTracks: CourseTrack[] = [
  {
    track_id: 1,
    title: 'QC Foundations',
    description: 'Core onboarding for QC analysts and implementation teams.',
    seq: 1,
    created_at: '2026-05-01T09:00:00Z',
  },
];

export const mockCourseSeries: CourseSeries[] = [
  {
    series_id: 1,
    title: 'Implementation Essentials',
    description: 'Courses that introduce implementation workflows, data checks, and training scenarios.',
    track_id: 1,
    track_seq: 1,
    created_at: '2026-05-01T09:05:00Z',
  },
];

const baseSlide = {
  lesson_id: 101,
  created_at: '2026-05-02T10:00:00Z',
  image_url: null,
  sql_text: null,
  sql_label: null,
  verify_mode: null,
  expected_json: null,
  quiz_question: null,
  quiz_options: null,
  quiz_answer: null,
  quiz_explanation: null,
  hints: null,
  presenter_notes: null,
  seed_sql: null,
  seed_label: null,
} satisfies Partial<CourseSlide>;

export const mockCourseSlides: CourseSlide[] = [
  {
    ...baseSlide,
    slide_id: 1001,
    seq: 0,
    slide_type: 'narrative',
    title: 'Why Enrollment Data Matters',
    content: 'Eligibility drives everything that follows: PCP assignment, referrals, claims, and payment. This course follows one family through that chain.',
    presenter_notes: 'Anchor the lesson in the Miller Family scenario before opening the database.',
  },
  {
    ...baseSlide,
    slide_id: 1002,
    seq: 1,
    slide_type: 'live_demo',
    title: 'Inspect Family Eligibility',
    content: 'Use a focused query to inspect the member and family eligibility records that power the scenario.',
    sql_label: 'Family eligibility records',
    sql_text: "SELECT TOP 10 fe.family_eligibility_ud, m.member_ud, bp.benefit_plan_ud\nFROM family_eligibility fe\nJOIN family_eligibility_member fem ON fem.family_eligibility_id = fe.family_eligibility_id\nJOIN member m ON m.member_id = fem.member_id\nJOIN benefit_plan bp ON bp.benefit_plan_id = fem.benefit_plan_id;",
  },
  {
    ...baseSlide,
    slide_id: 1003,
    seq: 2,
    slide_type: 'quiz',
    title: 'Eligibility Check',
    content: null,
    quiz_question: 'Which table ties a member to a family eligibility record?',
    quiz_options: ['member_name', 'family_eligibility_member', 'benefit_contract_period', 'claim_procedure'],
    quiz_answer: 1,
    quiz_explanation: 'family_eligibility_member is the bridge between the family eligibility header and each covered member.',
  },
  {
    ...baseSlide,
    slide_id: 1004,
    seq: 3,
    slide_type: 'do_it_in_qc',
    title: 'Verify PCP Assignment',
    content: 'Run the verification query and confirm the selected provider is attached to the expected member benefit plan.',
    sql_label: 'PCP assignment',
    sql_text: 'SELECT TOP 5 member_id, provider_id, effective_date FROM fembp_pcp ORDER BY effective_date DESC;',
    verify_mode: 'show',
    hints: ['Start from the member benefit plan record.', 'Look for the current effective date range.'],
    seed_label: 'Reset PCP assignment',
    seed_sql: 'UPDATE fembp_pcp SET term_date = NULL WHERE member_id = @memberId;',
  },
  {
    ...baseSlide,
    lesson_id: 102,
    slide_id: 1005,
    seq: 0,
    slide_type: 'reference',
    title: 'Reference Tables',
    content: 'Keep these tables nearby when validating benefit setup: `client`, `client_group`, `benefit_contract`, `benefit_plan`, and `family_eligibility`.',
  },
  {
    ...baseSlide,
    lesson_id: 102,
    slide_id: 1006,
    seq: 1,
    slide_type: 'sql_challenge',
    title: 'Find Active Coverage',
    content: 'Write a query that returns active member coverage for the scenario family.',
    sql_label: 'Coverage query',
    sql_text: 'SELECT member_id, benefit_plan_id, effective_date, term_date FROM family_eligibility_member_benefit_plan WHERE term_date IS NULL;',
    hints: ['Filter out termed rows.', 'Join back to member if you need names.'],
  },
  {
    ...baseSlide,
    lesson_id: 102,
    slide_id: 1007,
    seq: 2,
    slide_type: 'screenshot_task',
    title: 'Capture Verification Evidence',
    content: 'Capture the final eligibility verification screen for the implementation record.',
  },
];

// Convert mock slides to blocks (CourseBlock uses block_id/block_type instead of slide_id/slide_type)
function slideToBlock(slide: CourseSlide) {
  return {
    block_id: slide.slide_id,
    lesson_id: slide.lesson_id,
    seq: slide.seq,
    block_type: slide.slide_type,
    title: slide.title,
    content: slide.content,
    image_url: slide.image_url,
    sql_text: slide.sql_text,
    sql_label: slide.sql_label,
    verify_mode: slide.verify_mode,
    expected_json: slide.expected_json,
    quiz_question: slide.quiz_question,
    quiz_options: slide.quiz_options,
    quiz_answer: slide.quiz_answer,
    quiz_explanation: slide.quiz_explanation,
    hints: slide.hints,
    presenter_notes: slide.presenter_notes,
    seed_sql: slide.seed_sql,
    seed_label: slide.seed_label,
    created_at: slide.created_at,
  };
}

export const mockCourseDetail: CourseDetail = {
  course_id: 42,
  title: 'Implementation Essentials: Family Enrollment',
  description: 'A practical course that teaches enrollment validation through a realistic family scenario.',
  category: 'Implementation',
  status: 'draft',
  cover_image_url: null,
  series_id: 1,
  series_seq: 1,
  actor: 'Implementation Analyst',
  track_id: 1,
  track_seq: 1,
  created_at: '2026-05-02T10:00:00Z',
  updated_at: '2026-05-04T15:00:00Z',
  lessons: [
    {
      lesson_id: 101,
      course_id: 42,
      seq: 0,
      title: 'Enrollment Data Trail',
      description: 'Follow the records that establish eligibility and covered members.',
      blocks: mockCourseSlides.filter((s) => s.lesson_id === 101).map(slideToBlock),
      slides: mockCourseSlides.filter((s) => s.lesson_id === 101),
    },
    {
      lesson_id: 102,
      course_id: 42,
      seq: 1,
      title: 'Coverage Verification',
      description: 'Use SQL checks to prove the benefit setup is ready for downstream workflows.',
      blocks: mockCourseSlides.filter((s) => s.lesson_id === 102).map(slideToBlock),
      slides: mockCourseSlides.filter((s) => s.lesson_id === 102),
    },
  ],
};

export const mockCourseListItems: CourseListItem[] = [
  {
    course_id: mockCourseDetail.course_id,
    title: mockCourseDetail.title,
    description: mockCourseDetail.description,
    category: mockCourseDetail.category,
    status: mockCourseDetail.status,
    cover_image_url: mockCourseDetail.cover_image_url,
    series_id: mockCourseDetail.series_id,
    series_seq: mockCourseDetail.series_seq,
    actor: mockCourseDetail.actor,
    track_id: mockCourseDetail.track_id,
    track_seq: mockCourseDetail.track_seq,
    created_at: mockCourseDetail.created_at,
    updated_at: mockCourseDetail.updated_at,
    lesson_count: mockCourseDetail.lessons.length,
    slide_count: mockCourseSlides.length,
  },
  {
    course_id: 43,
    title: 'Claims Adjudication Basics',
    description: 'Introduces claim headers, procedures, adjudication status, and payment review.',
    category: 'Claims',
    status: 'published',
    cover_image_url: null,
    series_id: 1,
    series_seq: 2,
    actor: 'Claims Analyst',
    track_id: 1,
    track_seq: 2,
    created_at: '2026-05-03T08:00:00Z',
    updated_at: '2026-05-05T12:00:00Z',
    lesson_count: 4,
    slide_count: 18,
  },
];

export const mockCourseDetails: Record<number, CourseDetail> = {
  42: mockCourseDetail,
};
