# Self-Hosted Past Paper PDFs

Put downloaded PDFs in this folder using the filenames already referenced by `assets/data/past-papers/papers.json`.

Generated catalogue:

- Years: `2024`, `2023`, `2022`, `2021`, `2019`
- Maths: Edexcel, 3 papers per year
- Computing: OCR, 2 papers per year
- Physics: AQA, 3 papers per year
- Chemistry: AQA, 3 papers per year
- Biology: OCR, 3 papers per year
- Economics: Edexcel, 3 papers per year
- Further Maths: Edexcel, 5 papers per year

Required file pattern:

- `{paper-id}-question-paper.pdf`
- `{paper-id}-mark-scheme.pdf`

Optional file pattern:

- `{paper-id}-examiner-report.pdf`

Each JSON entry should use direct PDF paths:

- `resources.paperPdfUrl`
- `resources.markSchemePdfUrl`
- `resources.examinerReportPdfUrl`
