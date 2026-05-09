-- ============================================================================
-- Course drafts: AI-generated planning documents for the authoring workbench
-- ----------------------------------------------------------------------------
-- Drafts are markdown documents associated with a course. They represent
-- different approaches or outlines that the author can browse, edit, and
-- promote to actual course content via build_course_content.
-- ============================================================================

CREATE TABLE course_draft (
  draft_id      INT IDENTITY(1,1) PRIMARY KEY,
  course_id     INT            NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  title         NVARCHAR(300)  NOT NULL,
  content       NVARCHAR(MAX)  NOT NULL,
  source        NVARCHAR(50)   NULL,
  status        NVARCHAR(20)   NOT NULL DEFAULT 'draft',
  created_at    DATETIME2      DEFAULT SYSUTCDATETIME(),
  updated_at    DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO
