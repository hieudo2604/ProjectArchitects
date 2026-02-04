# Software Design Assignment

## Overview

Design a feature for your own project using visual diagrams. This assignment helps you think through your system before writing code.

## Choose Your User Story

Select one user story from your project that involves:<br>
As a project manager, I want to create a task and assign it to a team member so that work can be tracked and completed on time.

## Deliverables

Using any drawing tool, create the following diagrams.

---

### 1. Context Diagram (10 points)

**What it's for:** Shows the big picture—who uses your system and what external systems it connects to. Helps you identify boundaries and dependencies before diving into details.

Include:
```
                 ┌────────────────────┐
                 │   Project Manager  │
                 └─────────┬──────────┘
                           │
              Create / Assign Task
                           │
                           ▼
┌─────────────────────────────────────────┐
│        Project Management System        │
│                                         │
│  - Task Creation Logic                  │
│  - Task Assignment Logic                │
│  - Validation & Business Rules          │
└───────────┬───────────────┬─────────────┘
            │               │
            │               │
   Store / Retrieve      Send Notification
            │               │
            ▼               ▼
┌────────────────┐   ┌──────────────────┐
│   Database     │   │ Notification     │
│ (Tasks, Users, │   │ Service (Email / │
│  Assignments)  │   │ Push Alerts)     │
└────────────────┘   └──────────────────┘
                           ▲
                           │
                 ┌─────────┴──────────┐
                 │   Team Member      │
                 └────────────────────┘

```

---

### 2. User Flow Diagram (15 points)

**What it's for:** Maps the user's journey through your feature step-by-step. Reveals missing screens, confusing paths, and edge cases you might forget when coding.

```
[Entry Point]
   |
   v
[Login Screen]
   |
   v
◇ Is login valid? ◇
   | Yes                           | No
   v                               v
[Dashboard]                   [Login Error]
   |                               |
   |                               └──> [Retry Login]
   |
   v
[Create New Project Screen]
   |
   v
◇ Create project? ◇
   | Yes                           | Cancel
   v                               v
[Project Screen]               [Dashboard]
   |
   v
[Create Task / Assign Member Screen]
   |
   v
[Enter Task Details + Select Team Member]
   |
   v
◇ Are inputs valid? ◇
   | Yes                           | No
   v                               v
[Project Management System]   [Validation Error]
   |                               |
   |                               └──> [Edit Task / Assignment]
   |
   v
[Save Task & Assignment]
   |
   v
[Database]
   |
   v
◇ Save successful? ◇
   | Yes                           | No
   v                               v
[Task Created Successfully]   [System Error]
   |                               |
   v                               └──> [Retry / Cancel]
[Dashboard – Updated Task List]

```

---

### 3. Sequence Diagram (20 points)

**What it's for:** Shows how components talk to each other over time for one specific flow. Exposes timing issues, missing error handling, and unclear responsibilities between services.

Include:
- All components involved (frontend, API, database, services)
- Arrows labeled with verb + payload (e.g., `POST /users`)
- One failure scenario with retry or fallback

---

### 4. State Machine (optional)

**What it's for:** Shows all possible states an entity can be in and how it transitions between them. Prevents bugs from invalid state transitions and clarifies business logic.

Include:
- All valid states for a key entity
- Transitions with trigger labels
- Terminal states (success, cancelled, failed)

---

### 5. Design Context Block (5 points)

**What it's for:** Forces you to articulate *why* you're building this before *how*. Keeps the team aligned on goals and constraints.

Add a text block with:
- Problem statement (1 sentence)
- Target user
- Success metric
- Key constraint

---

### 6. Open Questions (5 points)

**What it's for:** Acknowledges what you don't know yet. Prevents assumptions from becoming bugs later.

Add 3 sticky notes identifying unresolved questions with owner and due date.

---

## Notation

Use consistent conventions:
- Solid arrows = synchronous calls
- Dashed arrows = async events
- Cylinders = databases
- Rounded rectangles = external systems
