# Self-Hosted Past Paper PDFs (Public Access)

**Goal**: Let non-logged-in visitors actually download real A-Level past papers + mark schemes.

## Recommended Source (as requested)
YesGenie.com has a large free collection of A-Level papers (no login required for most):

- Main page: https://yesgenie.com/a-level?view=past-papers
- Direct examples:
  - https://yesgenie.com/a-level/maths/edexcel/past-papers
  - https://yesgenie.com/a-level/maths/aqa/past-papers
  - https://yesgenie.com/a-level/physics/aqa/past-papers

**Official board sources** (always the most authoritative):
- AQA: https://www.aqa.org.uk/past-papers-and-mark-schemes-finder
- Edexcel/Pearson: https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html
- OCR: https://www.ocr.org.uk/qualifications/past-paper-finder/

## How to add real PDFs to this site
1. Download PDFs from YesGenie or official boards.
2. Rename them following this pattern and place them in this `pdfs/` folder:
   - `edexcel-maths-9ma0-01-2024-paper.pdf`
   - `edexcel-maths-9ma0-01-2024-ms.pdf`
3. Update the corresponding entry in:
   `assets/data/resources/alevel/past-papers.json`
   Change `"paperUrl": "#"` → `"paperUrl": "/assets/data/past-papers/pdfs/edexcel-maths-9ma0-01-2024-paper.pdf"`

When a public visitor clicks Download, it will now open the local PDF directly in a new tab (no login message).

**Note on copyright**: Exam boards allow free personal/educational use. Hosting on your own site for students is generally acceptable if you add proper attribution and don't charge for access.

## Current behaviour (public visitors)
- Past Papers page (`/past_papers/index.html`): Subject → Year flow → clicking buttons opens in new tab (prefers local PDF if you add them, otherwise falls back to YesGenie/official sources).
- Rich public hub on `/r/index.html`: Buttons open the nice paper explorer in a new tab.

No more "login required" messages for public users.
