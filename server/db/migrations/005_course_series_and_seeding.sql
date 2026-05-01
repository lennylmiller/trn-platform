-- ============================================================================
-- Course series, actors, dependencies, and seed SQL support
-- ============================================================================

-- Series: groups courses in order
CREATE TABLE course_series (
  series_id      INT IDENTITY(1,1) PRIMARY KEY,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO

-- Link course to series (a course can belong to one series)
ALTER TABLE course ADD
  series_id      INT            NULL REFERENCES course_series(series_id),
  series_seq     INT            NULL,
  actor          NVARCHAR(100)  NULL;
GO

-- Course dependencies (which courses must be completed/seeded before this one)
CREATE TABLE course_dependency (
  dependency_id      INT IDENTITY(1,1) PRIMARY KEY,
  course_id          INT NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  depends_on_course_id INT NOT NULL REFERENCES course(course_id),
  CONSTRAINT UQ_course_dependency UNIQUE (course_id, depends_on_course_id)
);
GO

-- Seed SQL per slide: the SQL that creates the data if the learner skips manual entry
ALTER TABLE course_slide ADD
  seed_sql       NVARCHAR(MAX)  NULL,
  seed_label     NVARCHAR(200)  NULL;
GO
