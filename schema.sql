-- schema.sql
-- Cloudflare D1 (SQLite) Schema for CBC Assessment Translation Hub

CREATE TABLE IF NOT EXISTS Students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    parent_email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Pre-populate Subjects with the 9 mandatory Junior Secondary School learning areas
INSERT OR IGNORE INTO Subjects (name) VALUES 
('English'),
('Kiswahili'),
('Mathematics'),
('Religious Education'),
('Social Studies'),
('Integrated Science'),
('Pre-Technical Studies'),
('Agriculture'),
('Creative Arts and Sports');

CREATE TABLE IF NOT EXISTS Assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    rubric_score TEXT NOT NULL CHECK (rubric_score IN ('EE', 'ME', 'AE', 'BE')),
    teacher_notes TEXT NOT NULL,
    ai_translated_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id)
);
