# CSE Review Studio

A focused Civil Service Exam review web app built for practice, pacing, and progress tracking.

The app includes full-length mock exams, topic drills, caselet activities, weak-spot review, formula cards, flashcards, and a distraction-free activity mode for answering questions.

Dedicated to **Tunet**.

## Live Preview

https://cse-reviewer-cyan.vercel.app/

## Highlights

- Professional and SubProfessional mock exam modes
- Practice mode with instant answer feedback
- Section drills and diagnostic activities
- Caselet-based questions
- Weak spot tracking
- Progress dashboard
- Formula library and flashcards
- Dark mode
- Mobile-friendly layout
- Focus mode during quizzes and mock exams
- Balanced randomizer for cleaner question variety

## Version Notes

### v10
- Improved the question randomizer
- Balanced question selection by topic, subtopic, and difficulty
- Added recent-repeat avoidance using browser storage
- Improved random selection for practice, drills, diagnostics, sprints, mocks, and weak spot review

### v9
- Added focused activity mode for quizzes, drills, diagnostics, and mocks
- Hid navigation, hero sections, and extra content while answering
- Added a cleaner activity screen with score, timer, progress, and exit control

### v8
- Improved the overall reviewer feel and wording
- Added more practice questions across laws, grammar, math, logic, and Filipino
- Expanded formula cards
- Added Tunet dedication

## Built With

- HTML
- CSS
- JavaScript
- LocalStorage

## Project Structure

```txt
index.html   main page
style.css    design and layout
data.js      questions, formulas, and reviewer data
app.js       quiz logic, scoring, settings, progress, and randomizer
vercel.json  Vercel routing
README.md    project documentation
