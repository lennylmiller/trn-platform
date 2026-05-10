-- ============================================================================
-- Slide container layer: visual screens that compose blocks + images
-- ----------------------------------------------------------------------------
-- A slide is what the learner sees on one screen. It contains one or more
-- elements (content blocks or images) arranged in a layout.
--
-- Hierarchy: Course → Lesson → Slide → SlideElement → Block or Image
--
-- Backwards compat: existing courses have no slides. The player falls back
-- to rendering blocks directly (one block = one screen) when no slides exist.
-- ============================================================================

CREATE TABLE course_slide (
  slide_id      INT IDENTITY(1,1) PRIMARY KEY,
  lesson_id     INT            NOT NULL REFERENCES course_lesson(lesson_id) ON DELETE CASCADE,
  seq           INT            NOT NULL,
  layout        NVARCHAR(30)   NOT NULL DEFAULT 'full',
  title         NVARCHAR(300)  NULL,
  notes         NVARCHAR(MAX)  NULL,
  created_at    DATETIME2      DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_course_slide_seq UNIQUE (lesson_id, seq)
);
GO

CREATE TABLE course_slide_element (
  element_id    INT IDENTITY(1,1) PRIMARY KEY,
  slide_id      INT            NOT NULL REFERENCES course_slide(slide_id) ON DELETE CASCADE,
  seq           INT            NOT NULL,
  element_type  NVARCHAR(20)   NOT NULL,
  block_id      INT            NULL REFERENCES course_block(block_id),
  image_url     NVARCHAR(500)  NULL,
  image_alt     NVARCHAR(300)  NULL,
  CONSTRAINT UQ_slide_element_seq UNIQUE (slide_id, seq)
);
GO
