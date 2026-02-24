LOOP — Minimal Product Feedback System

LOOP is a lightweight feedback management system built to help developers collect, manage, and iterate on structured product feedback.

It focuses on clarity, correctness, and change resilience rather than feature overload or UI complexity.

🚀 What It Does

Developers can:

Create projects

Generate public feedback links

Collect structured feedback

Update feedback status (NEW → ACCEPTED → RESOLVED / REJECTED)

Maintain status history with notes

Enforce feedback expiry (3 / 5 / 7 days)

Public users can:

Open shared feedback link

View project details

Submit categorized feedback

🏗 Tech Stack

Frontend:

React + TypeScript

Axios

Clean minimal UI

Backend:

Flask (REST API)

Flask-JWT-Extended

Flask-SQLAlchemy

SQLite (relational database)

🔁 Core Flow

User signs up / logs in

Creates a project

Shares public feedback link

Users submit feedback

Developer reviews and updates status

Status history is recorded

🧠 Key Design Principles

Simple, readable architecture

Enum-based state safety

Protected routes with JWT

Clear separation of concerns

Small, structured system over feature-heavy design

📂 Project Structure
LOOP/
├── backend/
├── frontend/
├── LOCAL_SETUP.md
├── SYSTEM_DEEP_DIVE.md
├── GEMINI.md
└── README.md
🛠 Setup

See LOCAL_SETUP.md for full instructions to run locally.

📄 Additional Documentation

SYSTEM_DEEP_DIVE.md → Architecture & technical decisions

GEMINI.md → AI usage and constraints

LOOP was built to demonstrate the ability to turn an idea into usable software quickly while keeping the system understandable and correct.