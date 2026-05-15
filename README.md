# CSE Review Studio

A mobile-friendly Civil Service Exam review web app built for focused practice, personal notes, and progress tracking.

The app includes mock exams, topic drills, math variants, General Information review, formula cards, and a personal study library where users can write notes, track mistakes, and review lessons by topic.

Dedicated to **Tunet**.

## Live Preview

https://cse-reviewer-cyan.vercel.app/

## Features

- Professional and SubProfessional review modes
- Full mock exam practice
- Topic-based drills
- Math Variant Drill with changing numbers
- Instant answer checking
- Explanations and shortcut methods
- Option to hide shortcuts or explanations
- Formula and shortcut section
- Personal study library
- Per-topic notes
- Mistake log
- Rules and formula notes
- Topic confidence and priority settings
- Progress tracking
- Weak-spot review
- Mobile-friendly layout
- Light and dark mode
- LocalStorage support for saved progress and notes

## Coverage

The reviewer covers common Civil Service Exam areas:

- Numerical Ability
- Verbal Ability
- Analytical Ability
- General Information
- Filipino
- Data Interpretation
- Abstract Reasoning
- Data Sufficiency
- Clerical Ability

General Information includes practice for:

- Philippine Constitution
- RA 6713
- Human Rights
- Environmental laws and concepts
- Accountability of public officers
- Constitutional commissions
- Public service ethics

## Study Library

The Library is designed as a personal reviewer space.

Each topic includes:

- Study guide
- Lessons
- Personal notes
- Mistake log
- Rules and formulas
- Subtopic coverage
- Quick topic drills

Notes and progress are saved in the browser using LocalStorage.

## Tech Stack

- HTML
- CSS
- JavaScript
- LocalStorage

No build step is required.

## Project Structure

```txt
index.html    main page
style.css     design and responsive layout
data.js       questions, formulas, lessons, and study data
app.js        app logic, scoring, notes, settings, and quiz flow
vercel.json   Vercel routing configuration
README.md     project documentation
