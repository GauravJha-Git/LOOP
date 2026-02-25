# LOOP — Minimal Product Feedback System

**LOOP** is a lightweight feedback management system designed to help developers collect, manage, and iterate on structured product feedback efficiently.

The system prioritizes **clarity, correctness, and resilience to change** over feature overload or unnecessary UI complexity.

---

## 🚀 What It Does

### For Developers

* Create projects
* Generate public feedback links
* Collect structured feedback
* Update feedback status *(NEW → ACCEPTED → RESOLVED / REJECTED)*
* Maintain status history with notes
* Enforce feedback expiry *(3 / 5 / 7 days)*

### For Public Users

* Open shared feedback links
* View project details
* Submit categorized feedback

---

## 🏗 Tech Stack

### Frontend

* React + TypeScript
* Axios
* Clean minimal UI

### Backend

* Flask (REST API)
* Flask-JWT-Extended
* Flask-SQLAlchemy
* SQLite (relational database)

---

## 🔁 Core Flow

1. User signs up / logs in
2. Creates a project
3. Shares public feedback link
4. Users submit feedback
5. Developer reviews and updates status
6. Status history is recorded

---

## 🧠 Key Design Principles

* Simple, readable architecture
* Enum-based state safety
* Protected routes with JWT
* Clear separation of concerns
* Small, structured system over feature-heavy design

---

## 📂 Project Structure

```
LOOP/
├── backend/
├── frontend/
├── LOCAL_SETUP.md
├── SYSTEM_DEEP_DIVE.md
├── GEMINI.md
└── README.md
```

---

## 🛠 Setup

Refer to **LOCAL_SETUP.md** for complete instructions to run the project locally.

---

## 📄 Additional Documentation

* **SYSTEM_DEEP_DIVE.md** → Architecture details and technical decisions
* **GEMINI.md** → AI usage and constraints

---

## ✨ Purpose

LOOP was built to demonstrate how an idea can quickly evolve into usable software while keeping the system understandable, structured, and technically sound.
