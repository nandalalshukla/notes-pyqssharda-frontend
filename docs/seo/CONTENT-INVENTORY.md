# Content inventory

20 original guides, 14,108 body words, researched and checked on 27 November 2026.
Counts exclude titles, navigation, citations and repeated template text.

Broad query ownership stays with `/library`, `/library/pyqs` and
`/library/syllabus`. Articles answer distinct supporting tasks rather than
creating multiple interchangeable landing pages for the same broad query.
Each article has source links, a primary collection link, supporting collection
links and three related articles. All articles are pre-rendered, listed in the
blog index and included in the sitemap.

| Article | Body words | Primary collection |
| --- | ---: | --- |
| [Sharda Library: Find Books, PYQs and Study Resources](/blogs/sharda-library-student-guide) | 722 | `/library` |
| [Sharda Library OPAC: Find the Right Book and Edition](/blogs/sharda-library-opac-book-search) | 723 | `/library` |
| [Sharda E Library Login: Official Access and Study PDFs](/blogs/sharda-e-library-login) | 692 | `/library` |
| [Sharda E Library Not Opening? A Troubleshooting Guide](/blogs/sharda-e-library-access-problems) | 676 | `/library` |
| [Plan a Productive Sharda Library Study Session](/blogs/sharda-library-study-session) | 714 | `/library` |
| [Use Sharda Library Resources for Project Research](/blogs/sharda-library-project-research) | 715 | `/library` |
| [Sharda University PYQ PDF Download: Step-by-Step Guide](/blogs/sharda-pyq-pdf-download) | 713 | `/library/pyqs` |
| [Find the Correct Sharda PYQ by Course Code and Semester](/blogs/sharda-pyq-course-code-search) | 712 | `/library/pyqs` |
| [Analyse Sharda PYQs Without Guessing the Next Exam](/blogs/sharda-pyq-repeated-topics) | 702 | `/library/pyqs` |
| [Practise Sharda PYQs Under Timed Exam Conditions](/blogs/sharda-pyq-timed-practice) | 694 | `/library/pyqs` |
| [A Seven-Day Sharda PYQ and Syllabus Revision Plan](/blogs/sharda-pyq-seven-day-plan) | 728 | `/library/pyqs` |
| [Cannot Find a Sharda PYQ? Search and Study Alternatives](/blogs/sharda-pyq-missing-paper) | 722 | `/library/pyqs` |
| [Sharda PYQs: Check Mid-Term, End-Term and Other Papers](/blogs/sharda-pyq-assessment-types) | 697 | `/library/pyqs` |
| [Sharda Syllabus PDF: Find the Correct Course and Batch](/blogs/sharda-syllabus-correct-batch) | 679 | `/library/syllabus` |
| [How to Read the Sharda B.Tech CSE Syllabus](/blogs/sharda-btech-cse-syllabus-guide) | 704 | `/library/syllabus` |
| [Turn Your Sharda Syllabus into a Unit-Wise Study Checklist](/blogs/sharda-syllabus-unit-checklist) | 696 | `/library/syllabus` |
| [Compare Sharda Syllabus Versions Before Using Old PYQs](/blogs/sharda-syllabus-curriculum-changes) | 701 | `/library/syllabus` |
| [Use Sharda Notes with Your Syllabus and PYQs](/blogs/sharda-notes-syllabus-gaps) | 698 | `/library/notes` |
| [Save Sharda PYQs and Syllabus PDFs for Offline Study](/blogs/sharda-offline-study-pdfs) | 718 | `/library` |
| [A Sharda First-Year Toolkit: Library, Syllabus and PYQs](/blogs/sharda-first-year-study-toolkit) | 702 | `/library` |

## Editing and maintenance

Edit `content/blogs/articles.json`. Keep `slug` stable. Change `updated` only
when the content has substantively changed; retain the original `published`
date. Add a new article to this data file to generate its static route, index
card and sitemap URL. Keep source notes accurate and verify official access
instructions before revising them. Run `pnpm build` and `pnpm seo:verify` against
the production server. The current verification suite expects this 20-article
launch; update its inventory expectation deliberately when adding articles.

The author is identified as Sharda Social and links to the existing About
page. No invented personal credentials, survey findings, firsthand experiences
or guaranteed exam outcomes are claimed. Official curriculum examples are
explicitly labelled by batch; study schedules are editorial recommendations.
