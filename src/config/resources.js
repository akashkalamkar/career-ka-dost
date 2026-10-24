/**
 * Free Resources page. Each class has subjects; each subject has downloads (`files`).
 *
 * To add a new PDF:
 *   1. Put the file in `public/resources/class-10/` (use a simple name, no spaces).
 *   2. Add it to the `files` list of the subject below. `file` is the name inside that class folder.
 * A subject with no files shows "Coming soon".
 */

/** `badge` is the bold red tag next to the title. `points` are the bold bullet lines under it. */
const file = (title, badge, folder, name, points) => ({ title, badge, points, path: `resources/${folder}/${name}` })

export const RESOURCE_CLASSES = [
  {
    id: 'class-9',
    label: 'Class 9',
    blurb: 'Build a strong base with practice material for Class 9.',
    subjects: [
      { id: 'english', name: 'English', files: [] },
      { id: 'maths', name: 'Mathematics', files: [] },
      { id: 'social-science', name: 'Social Science', files: [] },
      { id: 'science', name: 'Science', files: [] },
      { id: 'hindi', name: 'Hindi', files: [] },
    ],
  },
  {
    id: 'class-10',
    label: 'Class 10',
    blurb: 'Board exam 2027 practice for CBSE Class 10.',
    subjects: [
      {
        id: 'english',
        name: 'English',
        files: [
          file('5 Sample Papers', '(2027)', 'class-10', 'class-10-english-sample-papers.pdf', [
            'For 2027 board exam students',
            'Based on past year papers',
            'Latest updated CBSE 2026-27 syllabus',
            '5 full papers of 80 marks, latest 3-section pattern',
            'Reading, Grammar and Writing, and Literature',
          ]),
        ],
      },
      {
        id: 'maths',
        name: 'Mathematics',
        // Two papers for Maths: Basic and Standard. Add each PDF to its own list when ready.
        options: [
          {
            id: 'basic',
            name: 'Maths Basic',
            files: [
              file('5 Sample Papers', '(2027)', 'class-10', 'class-10-maths-basic-sample-papers.pdf', [
                'For 2027 board exam students',
                'Based on past year papers',
                'Latest updated CBSE 2026-27 syllabus',
                '5 full papers of 80 marks, latest 5-section pattern',
                'MCQ, Assertion-Reason, Short Answer, Long Answer and Case Studies',
              ]),
            ],
          },
          {
            id: 'standard',
            name: 'Maths Standard',
            files: [
              file('5 Sample Papers', '(2027)', 'class-10', 'class-10-maths-standard-sample-papers.pdf', [
                'For 2027 board exam students',
                'Based on past year papers',
                'Latest updated CBSE 2026-27 syllabus',
                '5 full papers of 80 marks, latest 5-section pattern',
                'MCQ, Assertion-Reason, Short Answer, Long Answer and Case Studies',
              ]),
            ],
          },
        ],
      },
      {
        id: 'social-science',
        name: 'Social Science',
        files: [
          file('5 Sample Papers', '(2027)', 'class-10', 'class-10-social-science-sample-papers.pdf', [
            'For 2027 board exam students',
            'Based on past year papers',
            'Latest updated CBSE 2026-27 syllabus',
            '5 full papers of 80 marks, latest 4-section pattern',
            'A map sheet with every paper',
          ]),
        ],
      },
      {
        id: 'science',
        name: 'Science',
        files: [
          file('5 Sample Papers', '(2027)', 'class-10', 'class-10-science-sample-papers.pdf', [
            'For 2027 board exam students',
            'Based on past year papers',
            'Latest updated CBSE 2026-27 syllabus',
            '5 full papers of 80 marks, latest 3-section pattern',
            'Biology 30, Chemistry 25 and Physics 25 marks',
          ]),
        ],
      },
      {
        id: 'hindi',
        name: 'Hindi',
        // Two courses for Hindi: A and B. Add each PDF to its own list when ready.
        options: [
          {
            id: 'course-a',
            name: 'Hindi Course A',
            files: [
              file('5 Sample Papers', '(2027)', 'class-10', 'class-10-hindi-a-sample-papers.pdf', [
                'For 2027 board exam students',
                'Based on past year papers',
                'Latest updated CBSE 2026-27 syllabus',
                '5 full papers of 80 marks, latest 4-section pattern',
                'Comprehension, Grammar, Textbook and Writing sections',
              ]),
            ],
          },
          {
            id: 'course-b',
            name: 'Hindi Course B',
            files: [
              file('5 Sample Papers', '(2027)', 'class-10', 'class-10-hindi-b-sample-papers.pdf', [
                'For 2027 board exam students',
                'Based on past year papers',
                'Latest updated CBSE 2026-27 syllabus',
                '5 full papers of 80 marks, latest 4-section pattern',
                'Comprehension, Grammar, Textbook and Writing sections',
              ]),
            ],
          },
        ],
      },
      {
        id: 'information-technology',
        name: 'Information Technology',
        files: [
          file('5 Sample Papers', '(2027)', 'class-10', 'class-10-it-sample-papers.pdf', [
            'For 2027 board exam students',
            'Based on past year papers',
            'Latest updated CBSE 2026-27 syllabus',
            '5 full papers of 50 marks, latest 2-section pattern (Code 402)',
            'Objective Type and Subjective Type sections',
          ]),
        ],
      },
    ],
  },
  {
    id: 'class-11',
    label: 'Class 11',
    blurb: 'Practice material for Class 11 is on its way.',
    subjects: [
      { id: 'english', name: 'English', files: [] },
      { id: 'maths', name: 'Mathematics', files: [] },
      { id: 'physics', name: 'Physics', files: [] },
      { id: 'chemistry', name: 'Chemistry', files: [] },
      { id: 'biology', name: 'Biology', files: [] },
    ],
  },
  {
    id: 'class-12',
    label: 'Class 12',
    blurb: 'Practice material for Class 12 is on its way.',
    subjects: [
      { id: 'english', name: 'English', files: [] },
      { id: 'maths', name: 'Mathematics', files: [] },
      { id: 'physics', name: 'Physics', files: [] },
      { id: 'chemistry', name: 'Chemistry', files: [] },
      { id: 'biology', name: 'Biology', files: [] },
    ],
  },
]
