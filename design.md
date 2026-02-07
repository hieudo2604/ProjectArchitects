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
   |                               └──> [Edit Task]
   |
   v
[Save Task]
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

```
Web App ──▶ API: POST /projects/{projectId}/tasks
             {title, description, assigneeId, dueDate}

API ──▶ DB: Validate project + user permissions
API ◀── DB: OK ✓

API ──▶ DB: INSERT task {title, description, projectId}
API ◀── DB: taskId

API ──▶ Queue: TaskAssigned{taskId, assigneeId, idempotencyKey}

Web App ◀── API: 201 Created {taskId}

Queue ──▶ Notification Worker: process
Notification Worker ──▶ Email Service: POST /send
Notification Worker ──X Email Service: timeout
Notification Worker ──▶ retry (3x)
Notification Worker ──▶ DLQ: log for manual follow-up

```
---

### 4. State Machine (optional)

**What it's for:** Shows all possible states an entity can be in and how it transitions between them. Prevents bugs from invalid state transitions and clarifies business logic.

```
[Login] ──confirm──▶ [Dashboard] ──create project──▶ [Project Screen] ──create task / assign task──▶ [Task Created]
   ▲                     │                              │
   │                     │                              │
   └──── error ──────────┘                              └──── cancel ─────▶ [Dashboard]

```
---

### 5. Design Context Block (5 points)

**What it's for:** Forces you to articulate *why* you're building this before *how*. Keeps the team aligned on goals and constraints.

```
PROBLEM: Project managers lack a centralized way to create and assign tasks, causing missed deadlines and unclear ownership.
USER: Project managers managing active projects and team members.
SUCCESS METRIC: 85% of tasks are created and assigned within the system without follow-up clarification messages.
CONSTRAINT: Tasks cannot be assigned to users who are not members of the project.
```

---

### 6. Open Questions (5 points)

**What it's for:** Acknowledges what you don't know yet. Prevents assumptions from becoming bugs later.

Add 3 sticky notes identifying unresolved questions with owner and due date.

-Which API endpoint should be used for user authentication (/auth or /login)?<br>
-Are the advanced reporting features part of Phase 2, or are they deferred to a later release?

---


## Notation

Use consistent conventions:
- Solid arrows = synchronous calls
- Dashed arrows = async events
- Cylinders = databases
- Rounded rectangles = external systems
