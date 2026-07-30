# SignLearn Platform — Complete UI Wireframe Specifications

```text
================================================================================
INFOSYS SPRINGBOARD INTERNSHIP PROJECT DELIVERABLE
Project Name : AI-Powered Sign Language Learning & Assessment Platform (SignLearn)
Document Type: UI Wireframe & Layout Specifications
Document ID  : DOC-UI-WF-2026-V1
Version      : 1.0.0
Author       : Infosys Springboard Team 2 (Amrutha)
Date         : July 30, 2026
Status       : Complete (Milestone 1 Approved Deliverable)
================================================================================
```

---

## Document Control & Revision History

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-07-30 | Infosys Team 2 (Amrutha) | Initial complete release of Milestone 1 UI Wireframes and Layout Specifications. |

---

## Table of Contents

1. [Executive Overview & Objectives](#1-executive-overview--objectives)
2. [Scope, Assumptions & Operational Boundaries](#2-scope-assumptions--operational-boundaries)
3. [Design System & Standards Reference](#3-design-system--standards-reference)
4. [Screen Specifications & Wireframes](#4-screen-specifications--wireframes)
   - [4.1 Landing Page](#41-landing-page)
   - [4.2 Login Page](#42-login-page)
   - [4.3 Register Page](#43-register-page)
   - [4.4 Forgot Password Page](#44-forgot-password-page)
   - [4.5 Email Verification Page](#45-email-verification-page)
   - [4.6 Learner Dashboard Page](#46-learner-dashboard-page)
   - [4.7 Practice Screen](#47-practice-screen)
   - [4.8 Assessment Screen](#48-assessment-screen)
   - [4.9 Progress Dashboard Page](#49-progress-dashboard-page)
   - [4.10 Profile Page](#410-profile-page)
   - [4.11 Settings Page](#411-settings-page)
   - [4.12 Dataset Management Screen (Admin)](#412-dataset-management-screen-admin)
   - [4.13 Mobile Layout Specification (< 768px)](#413-mobile-layout-specification--768px)
   - [4.14 Tablet Layout Specification (768px – 1024px)](#414-tablet-layout-specification-768px--1024px)
   - [4.15 Desktop Layout Specification (> 1024px)](#415-desktop-layout-specification--1024px)
5. [Visual Assets Reference](#5-visual-assets-reference)
6. [Future Enhancements & Roadmap](#6-future-enhancements--roadmap)
7. [References & Appendix](#7-references--appendix)
8. [Glossary of Terms](#8-glossary-of-terms)

---

## 1. Executive Overview & Objectives

The **AI-Powered Sign Language Learning & Assessment Platform (SignLearn)** is a web-based educational platform designed to empower learners to master American Sign Language (ASL), Indian Sign Language (ISL), and British Sign Language (BSL). The platform integrates real-time interactive computer vision gesture evaluation, gamified curriculum paths, comprehensive self-assessment modules, and detailed progress analytics.

### Document Objectives:
- Provide low-fidelity ASCII wireframes and layout structures for all 12 platform screens and 3 device form-factor specifications (Mobile, Tablet, Desktop).
- Standardize UI component boundaries, navigation paths, user interactions, and WCAG 2.1 AA accessibility guidelines.
- Serve as the authoritative design reference for frontend developers and UI/UX engineering teams in Phase 2.

---

## 2. Scope, Assumptions & Operational Boundaries

> [!IMPORTANT]
> **Milestone 1 Scope Boundary**: This document represents design, wireframing, and documentation deliverables. **Zero source code modifications** were made to existing frontend or backend source files during this milestone.

### Scope Commitments:
- **No Frontend Modifications**: No Next.js components or React state files altered.
- **No Backend Modifications**: No FastAPI endpoints, routers, or schemas altered.
- **No Database Schema Alterations**: No PostgreSQL, MongoDB, or Redis entities modified.
- **No AI Dependency Execution**: No MediaPipe or TensorFlow models executed in this milestone.

---

## 3. Design System & Standards Reference

### 3.1 Color Palette (Dark-Mode Ready)
- **Primary Background (`--bg-dark`)**: `#0F172A` (Slate 900)
- **Secondary Card (`--bg-card`)**: `#1E293B` (Slate 800)
- **Border Neutral (`--border-main`)**: `#334155` (Slate 700)
- **Primary Accent (`--accent-blue`)**: `#3B82F6` (Blue 500)
- **Success / Correct (`--accent-green`)**: `#22C55E` (Emerald 500)
- **Warning / Partial (`--accent-amber`)**: `#F59E0B` (Amber 500)
- **Error / Incorrect (`--accent-red`)**: `#EF4444` (Red 500)
- **Text Main (`--text-primary`)**: `#F8FAFC` (Slate 50)
- **Text Muted (`--text-secondary`)**: `#94A3B8` (Slate 400)

### 3.2 Typography & Grid
- **Font Family**: Primary `Inter, sans-serif`, Display `Outfit, sans-serif`.
- **Base Grid**: 8px baseline grid system.
- **Breakpoints**: Mobile (`< 768px`), Tablet (`768px - 1024px`), Desktop (`> 1024px`).

---

## 4. Screen Specifications & Wireframes

---

### 4.1 Landing Page

#### Purpose & User Goal
Provide a high-impact, modern entry point explaining platform capabilities, feature highlights, and CTA buttons to login or register.

#### Navigation Flow
- Entry: `GET /`
- Next States: `GET /login` (Login CTA), `GET /register` (Register CTA), `GET /#features`.

#### Components Breakdown
- **Header/Navbar**: Logo ("SignLearn AI"), Nav Links (Features, Curriculum, About, Contact), CTA Buttons ("Sign In", "Get Started").
- **Main Content**:
  - Hero Section: Headline "Master Sign Language with Real-Time AI Feedback", Subtitle, "Start Learning Free" CTA button, Interactive Demo Banner.
  - Value Proposition Grid: 3 Cards (Real-time Vision AI feedback, Gamified Learning Path, Accredited Certificates).
  - Feature Showcase Section: Step-by-step interactive workflow diagram.
- **Footer**: Copyright, Privacy Policy, Terms of Service, Social Links.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
|  [Logo] SignLearn AI        Features   Curriculum   About       [Login] [Register]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|            Master Sign Language with Real-Time AI Gesture Recognition             |
|        Practice ASL & ISL interactively using your webcam with instant feedback   |
|                                                                                   |
|                           [ Start Learning for Free ]                             |
|                                                                                   |
|    +--------------------+  +--------------------+  +--------------------+         |
|    | Real-Time Vision   |  | Interactive Path   |  | Progress Analytics |         |
|    | 21-point tracking  |  | Level 1 to Master  |  | Streaks & Accuracy |         |
|    +--------------------+  +--------------------+  +--------------------+         |
|                                                                                   |
+-----------------------------------------------------------------------------------+
| (c) 2026 SignLearn AI Platform. All rights reserved.          Privacy | Terms     |
+-----------------------------------------------------------------------------------+
```

#### Accessibility & Responsive Notes
- WAI-ARIA `role="navigation"` on Navbar. All CTA buttons have high contrast ratio > 4.5:1.
- Mobile: Collapsible hamburger menu replaces nav links. Card grid collapses to single column.

---

### 4.2 Login Page

#### Purpose & User Goal
Authenticate returning learners and administrators securely using email and password credentials.

#### Navigation Flow
- Entry: `GET /login`
- Next States: `GET /dashboard` (Successful authentication), `GET /forgot-password`, `GET /register`.

#### Components Breakdown
- **Header**: SignLearn Logo and home navigation link.
- **Main Content**: Centered Form Card:
  - Form Title: "Welcome Back"
  - Inputs: Email Address field, Password field (with show/hide toggle).
  - Actions: "Remember Me" checkbox, "Forgot Password?" text link.
  - CTA Button: "Sign In" (Primary Full Width).
  - Social Auth Placeholders: "Sign in with Google", "Sign in with GitHub".
  - Footer Link: "Don't have an account? Register".

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
|  [Logo] SignLearn AI                                                 [ Back Home ]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                        +---------------------------------+                        |
|                        |          Welcome Back           |                        |
|                        | Sign in to your SignLearn account|                        |
|                        |                                 |                        |
|                        | Email Address                   |                        |
|                        | [ user@example.com            ] |                        |
|                        |                                 |                        |
|                        | Password                        |                        |
|                        | [ ****************        [show]|                        |
|                        |                                 |                        |
|                        | [x] Remember me  [Forgot Pass?]|                        |
|                        |                                 |                        |
|                        |          [ SIGN IN ]            |                        |
|                        |                                 |                        |
|                        | Don't have an account? Register |                        |
|                        +---------------------------------+                        |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

#### Accessibility & Responsive Notes
- Inputs contain explicit `<label>` tags with matching `htmlFor` IDs. Form errors read aloud via `aria-live="polite"`.

---

### 4.3 Register Page

#### Purpose & User Goal
Allow new learners to create an account by selecting a role, entering personal details, and setting password credentials.

#### Navigation Flow
- Entry: `GET /register`
- Next States: `GET /verify-email` (Successful submission), `GET /login`.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
|                        +---------------------------------+                        |
|                        |       Create Your Account       |                        |
|                        | Full Name                       |                        |
|                        | [ Jane Doe                    ] |                        |
|                        | Email Address                   |                        |
|                        | [ jane@example.com            ] |                        |
|                        | Password (min 8 chars)          |                        |
|                        | [ ****************            ] |                        |
|                        | Confirm Password                |                        |
|                        | [ ****************            ] |                        |
|                        | Primary Sign Language           |                        |
|                        | [ ASL (American Sign Language)v]|                        |
|                        | [x] I agree to Terms & Privacy  |                        |
|                        |         [ CREATE ACCOUNT ]      |                        |
|                        +---------------------------------+                        |
+-----------------------------------------------------------------------------------+
```

---

### 4.4 Forgot Password Page

#### Purpose & User Goal
Initiate account password recovery by dispatching a secure reset link to the registered user email address.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
|                        +---------------------------------+                        |
|                        |       Reset Your Password       |                        |
|                        | Enter registered email address: |                        |
|                        | [ user@example.com            ] |                        |
|                        |     [ SEND RESET LINK ]         |                        |
|                        |         < Back to Login         |                        |
|                        +---------------------------------+                        |
+-----------------------------------------------------------------------------------+
```

---

### 4.5 Email Verification Page

#### Purpose & User Goal
Prompt user to verify their email inbox using a 6-digit OTP code before activating account access.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
|                        +---------------------------------+                        |
|                        |      Verify Email Address       |                        |
|                        | Enter 6-digit verification code |                        |
|                        | [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]                      |
|                        |         [ VERIFY EMAIL ]        |                        |
|                        | Didn't receive? [Resend Code]   |                        |
|                        +---------------------------------+                        |
+-----------------------------------------------------------------------------------+
```

---

### 4.6 Learner Dashboard Page

#### Purpose & User Goal
Central hub displaying overall learning stats, active courses, daily streak, quick action launchpad, and analytics charts.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| [Sidebar]  | [Search bar...          ]   (Notifications: 3)   [ Profile Dropdown v]|
|------------+----------------------------------------------------------------------|
| Dashboard  | Welcome back, Alex!                                                  |
| Learn      | +--------------+ +--------------+ +--------------+ +---------------+ |
| Practice   | | Lessons: 24  | | Accuracy: 94%| | Streak: 7d   | | Level 4 (XP)  | |
| Assessments| +--------------+ +--------------+ +--------------+ +---------------+ |
| Progress   | Quick Actions: [ Start Lesson ] [ Practice Signs ] [ Take Assessment]|
| Settings   | Continue Learning:                                                   |
|            | +------------------------------------------------------------------+ |
|            | | Module 3: Alphabet A-Z | Progress: 65% | [ Resume Lesson ]    | |
|            | +------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

### 4.7 Practice Screen

#### Purpose & User Goal
Provide real-time webcam feedback for practicing sign gestures using MediaPipe landmark overlays and instant accuracy scoring HUD.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| Practice Mode: ASL Alphabet - Sign "B"                    [ Exit Practice ]      |
+--------------------------------------------------+--------------------------------|
| Live Webcam Feed                                 | Target Sign Reference          |
| +----------------------------------------------+ | +----------------------------+ |
| |                                              | | | [ Sign "B" Image Guide ]   | |
| |      [ 21 Hand Landmarks Overlay Enabled ]   | | +----------------------------+ |
| |                                              | | Instructions:                | |
| |                                              | | Open palm with thumb across. | |
| +----------------------------------------------+ | Real-Time Feedback HUD:      | |
| FPS: 30 | Latency: 15ms                          | Match Score: 96% (EXCELLENT)  | |
| Controls: [ Toggle Landmarks ] [ Flip Camera ]  | [ Next Gesture ]               | |
+--------------------------------------------------+--------------------------------+
```

---

### 4.8 Assessment Screen

#### Purpose & User Goal
Conduct formal timed evaluations of sign gestures with submission controls and live scorecard summary popups.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| Assessment: ASL Basic Certification (Time Remaining: 04:45)     [ Quit Test ]    |
+--------------------------------------------------+--------------------------------|
| Live Assessment Video                            | Question 4 of 10:              |
| +----------------------------------------------+ | Perform Sign: "THANK YOU"      |
| |                                              | | Status: Recording...         |
| |          [ Webcam Assessment Feed ]          | | [ Capture Gesture ]          |
| |                                              | | Scores Submitted:            |
| +----------------------------------------------+ | Q1: PASS (98%)  Q2: PASS (91%) |
| [ Record Sign ]    [ Submit Question ]          | Q3: PASS (94%)  Q4: PENDING    |
+--------------------------------------------------+--------------------------------+
```

---

### 4.9 Progress Dashboard Page

#### Purpose & User Goal
Detailed analytical breakdown of skill mastery, historical quiz scores, gesture accuracy trends, and streak calendars.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| Overall Mastery: 82% | Total Practice Time: 14h 20m | Signs Learned: 48           |
+-----------------------------------------------------------------------------------+
| Accuracy Trend Chart (Last 30 Days)                                               |
|  100% |       .-.   .-.                                                           |
|   50% |   ._.'   'v'   '--.                                                       |
|    0% +------------------------                                                   |
+-----------------------------------------------------------------------------------+
| Skill Breakdown Grid:                                                             |
| - Alphabets (A-Z)   : 98% Mastery [==========]                                    |
| - Numbers (0-9)     : 85% Mastery [========  ]                                    |
| - Common Phrases    : 60% Mastery [======    ]                                    |
+-----------------------------------------------------------------------------------+
```

---

### 4.10 Profile Page

#### Purpose & User Goal
Display personal details, preferred sign language dialect, earned certificates, unlocked badges, and statistical summary.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| [Avatar] Alex Johnson                                                             |
| Level 4 Scholar | Member since June 2026 | Preferred Dialect: ASL                  |
| Edit Profile: [ Change Photo ] [ Update Bio ]                                     |
+-----------------------------------------------------------------------------------+
| Earned Achievements:                                                              |
| [Badge: 7-Day Streak]   [Badge: 100% Accuracy]   [Badge: Alphabet Master]         |
+-----------------------------------------------------------------------------------+
```

---

### 4.11 Settings Page

#### Purpose & User Goal
Configure hardware webcam/audio input devices, notification preferences, display theme, and API security keys.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| Platform Settings                                                                 |
| Hardware Preferences:                                                             |
| Camera Input:  [ Integrated HD Webcam (1080p)               v]                   |
| Audio Input:   [ Default Microphone (Realtek Audio)         v]                   |
| Preferences:                                                                      |
| [x] Enable Real-Time Audio Feedback Prompts                                       |
| [x] High-Contrast UI Mode                                                         |
| [ ] Email Notifications for Daily Streaks                                         |
| [ Save Settings ]                                                                 |
+-----------------------------------------------------------------------------------+
```

---

### 4.12 Dataset Management Screen (Admin)

#### Purpose & User Goal
Administrative console for dataset creators to upload raw gesture samples, review MediaPipe landmark annotations, and track pipeline logs.

#### ASCII Wireframe
```text
+-----------------------------------------------------------------------------------+
| Dataset Management Console (Admin)                    [ + Upload New Dataset ]     |
+-----------------------------------------------------------------------------------+
| Filter Datasets: Dialect: [ ASL v ] Class: [ All v ] Status: [ Annotated v ]     |
| +----+---------------+---------+----------------+---------------+---------------+ |
| | ID | Gesture Name  | Samples | MediaPipe Code | Status        | Actions       | |
| +----+---------------+---------+----------------+---------------+---------------+ |
| | 01 | ASL_Letter_A  | 1,200   | MP_HAND_21     | Ready         | [Edit] [Del]  | |
| | 02 | ASL_Letter_B  | 1,150   | MP_HAND_21     | Processing... | [View Logs]   | |
| +----+---------------+---------+----------------+---------------+---------------+ |
+-----------------------------------------------------------------------------------+
```

---

### 4.13 Mobile Layout Specification (< 768px)

#### Layout Strategy
- Single column stacked layout.
- Persistent top bar with hamburger menu trigger for off-canvas drawer navigation.
- Touch-optimized targets (minimum 44x44px).
- Embedded webcam aspect ratio locked to 4:3 responsive container.

#### ASCII Breakdown
```text
+-----------------------+
| [=] SignLearn    (3)  |
+-----------------------+
| Welcome, Alex!        |
| Stats Summary:        |
| - Lessons : 24        |
| - Accuracy: 94%       |
| - Streak  : 7 Days    |
+-----------------------+
| [ Start Practice ]    |
+-----------------------+
| Continue Learning:    |
| Module 3: Alphabet    |
| Progress: 65%         |
+-----------------------+
```

---

### 4.14 Tablet Layout Specification (768px – 1024px)

#### Layout Strategy
- 2-column adaptive grid.
- Left sidebar collapses to icon-only mini rail (64px width).
- Main canvas utilizes fluid 12-column grid.

#### ASCII Breakdown
```text
+-------------------------------------------------------------------+
| [I] | Top Navbar Search...                             [Profile v]|
| [L] |-------------------------------------------------------------|
| [P] | Welcome, Alex!                                              |
| [A] | +----------------------+ +--------------------------------+ |
| [S] | | Active Progress: 65% | | Quick Actions: Practice / Test | |
|     | +----------------------+ +--------------------------------+ |
+-------------------------------------------------------------------+
```

---

### 4.15 Desktop Layout Specification (> 1024px)

#### Layout Strategy
- 3-column structured architecture: Left Sidebar (250px), Main Content Area (Fluid), Right Statistics Rail (300px).
- Full persistent navigation, interactive data visualization, real-time webcam frame canvas.

---

## 5. Visual Assets Reference

Visual design mockups and diagram graphics generated for this milestone are archived in the root `design/` folder:
- `design/ui-wireframes.png`
- `design/ui-wireframes.pdf`

---

## 6. Future Enhancements & Roadmap

- **Phase 2 (Milestone 2)**: Integration of live MediaPipe WebGL client canvas.
- **Phase 3 (Milestone 3)**: Offline gesture recognition cache via WebAssembly (WASM).

---

## 7. References & Appendix

1. WCAG 2.1 AA Web Content Accessibility Guidelines.
2. Google MediaPipe Hands 3D Landmark Specification.

---

## 8. Glossary of Terms

- **ASL**: American Sign Language.
- **ISL**: Indian Sign Language.
- **MediaPipe**: Google framework for multi-modal applied ML pipelines.
- **Landmarks**: 21 key 3D coordinate joints extracted from a human hand.
