-- ============================================================================
-- Courses domain: interactive training course builder
-- ============================================================================

CREATE TABLE course (
  course_id       INT IDENTITY(1,1) PRIMARY KEY,
  title           NVARCHAR(300)  NOT NULL,
  description     NVARCHAR(MAX)  NULL,
  category        NVARCHAR(50)   NULL,
  status          NVARCHAR(20)   NOT NULL DEFAULT 'draft',
  cover_image_url NVARCHAR(500)  NULL,
  created_at      DATETIME2      DEFAULT SYSUTCDATETIME(),
  updated_at      DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE course_section (
  section_id      INT IDENTITY(1,1) PRIMARY KEY,
  course_id       INT            NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  seq             INT            NOT NULL,
  title           NVARCHAR(300)  NOT NULL,
  description     NVARCHAR(MAX)  NULL,
  CONSTRAINT UQ_course_section_seq UNIQUE (course_id, seq)
);
GO

CREATE TABLE course_slide (
  slide_id        INT IDENTITY(1,1) PRIMARY KEY,
  section_id      INT            NOT NULL REFERENCES course_section(section_id) ON DELETE CASCADE,
  seq             INT            NOT NULL,
  slide_type      NVARCHAR(30)   NOT NULL,
  title           NVARCHAR(300)  NULL,
  content         NVARCHAR(MAX)  NULL,
  image_url       NVARCHAR(500)  NULL,
  sql_text        NVARCHAR(MAX)  NULL,
  sql_label       NVARCHAR(200)  NULL,
  verify_mode     NVARCHAR(20)   NULL,
  expected_json   NVARCHAR(MAX)  NULL,
  quiz_question   NVARCHAR(MAX)  NULL,
  quiz_options    NVARCHAR(MAX)  NULL,
  quiz_answer     INT            NULL,
  quiz_explanation NVARCHAR(MAX) NULL,
  hints           NVARCHAR(MAX)  NULL,
  presenter_notes NVARCHAR(MAX)  NULL,
  created_at      DATETIME2      DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_course_slide_seq UNIQUE (section_id, seq)
);
GO

CREATE TABLE upload (
  upload_id       INT IDENTITY(1,1) PRIMARY KEY,
  filename        NVARCHAR(500)  NOT NULL,
  original_name   NVARCHAR(500)  NOT NULL,
  mime_type       NVARCHAR(100)  NOT NULL,
  size_bytes      INT            NOT NULL,
  uploaded_at     DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO
