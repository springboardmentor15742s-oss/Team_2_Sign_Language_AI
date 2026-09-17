# SignSpeak — Adaptive Learning & Recommendation Engine (`recommendation_engine.py`)
**Infosys Springboard Internship 7.0 — Team 2**  
**Module:** Learning Progress Intelligence Engine (Module 8 & 11)  
**File:** `backend/recommendation_engine.py`

---

## 1. Purpose & Functional Objectives

`recommendation_engine.py` implements an adaptive learning algorithm. It analyzes a learner's historical practice attempts, isolates specific anatomical difficulties, assigns a proficiency mastery tier, and dynamically generates custom remedial practice playlists.

---

## 2. Recommendation Algorithm Workflow

[Learner Attempt History]
(Sign, Course, Accuracy, Mistake Type)
│
▼
[1. Accuracy Aggregation]
(Calculates Cumulative Average)
│
▼
[2. Weakness Identification]
(Filters Signs with Accuracy < 70%)
│
▼
[3. Error Clustering Analysis]
(Categorizes: Hand Shape vs. Motion vs. Timing)
│
▼
[4. Curriculum Routing Engine]
(Selects Next Optimal Module)
│
▼
[5. Remedial Playlist Generator]
(Builds Targeted Drill Queue)

---

## 3. Scoring & Mastery Tiers

Learner performance is categorized into standardized competence tiers:

| Tier Name | Accuracy Range | Operational Status | System Action |
|---|---|---|---|
| **Tier I: Novice** | $< 65.0\%$ | Needs fundamental fingerspelling guidance | Routes to *Basics of ASL* foundational drill. |
| **Tier II: Intermediate** | $65.0\% - 79.9\%$ | Demonstrates isolated sign recall | Flags weak signs for targeted 2-second hold practice. |
| **Tier III: Proficient** | $80.0\% - 89.9\%$ | Strong gesture accuracy | Unlocks *Everyday & Family Communication*. |
| **Tier IV: Mastery** | $\ge 90.0\%$ | High-speed precision | Recommends *Medical & Professional Terms*. |

---

## 4. Remedial Drill Construction

When a learner exhibits recurring failure on specific signs (such as confusing `M` with `A` or `W` with `D`), the engine:
1. Deduplicates and isolates the failing signs.
2. Formats a high-priority queue (`target_drill_signs`).
3. Sends tailored pedagogical tips to the learner dashboard.