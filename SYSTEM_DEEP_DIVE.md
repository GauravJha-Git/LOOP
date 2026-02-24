# LOOP: System Deep Dive

## PRODUCT CONTEXT

### Problem Statement
In the early stages of product development, teams often struggle to collect structured, actionable feedback from users and testers. Feedback is frequently scattered across various channels like emails, chat messages, and social media, making it difficult to track, prioritize, and act upon. This disorganized approach leads to valuable insights being lost and a slower, less efficient product iteration cycle.

### Why Feedback Loops Matter in Early Products
For new products, especially those aiming for product-market fit, a tight feedback loop is critical. It enables development teams to:
- **Validate Assumptions:** Quickly confirm or invalidate the core hypotheses about user needs and product value.
- **Prioritize Development:** Use real user data to decide which features to build, fix, or improve next.
- **Increase User Engagement:** Show users that their voice is heard and valued, fostering a loyal early-adopter community.
- **Iterate Faster:** Reduce the time between deploying a feature and understanding its impact.

### Intended Users
LOOP is designed for:
- **Founders & Product Managers:** To centralize feedback and gain a high-level overview of user sentiment and recurring issues.
- **Developers:** To receive clear, contextualized bug reports and feature requests directly from testers.
- **QA Testers & Early Adopters:** To have a simple, dedicated channel for submitting feedback without the friction of complex bug-tracking systems.

### Product Lifecycle Use Case
LOOP is ideal for the alpha, beta, and early-access phases of a product's lifecycle. A team can create a project in LOOP, generate a public link, and share it with a select group of testers. Testers can submit feedback without needing to create an account, while the project owner manages the entire feedback lifecycle within a private, authenticated dashboard. The expiry-based nature of the links makes it suitable for time-boxed testing phases.

## ARCHITECTURE OVERVIEW

### Frontend-Backend Separation
LOOP is architected as two distinct applications:
- **Frontend:** A React single-page application (SPA) built with TypeScript.
- **Backend:** A Python-based API server built with the Flask framework.

This separation provides several advantages:
- **Independent Development:** The frontend and backend teams can work in parallel with minimal friction.
- **Technology Specialization:** Allows for using the best tools for the job—React for building interactive UIs and Flask for creating a robust API.
- **Scalability:** The frontend and backend can be scaled independently based on their respective loads.

### API-First Architecture Reasoning
An API-first approach was chosen to ensure a clear contract between the frontend and backend. The backend exposes a well-defined set of RESTful endpoints, and all frontend interactions are mediated through this API. This design makes the system more modular and allows for the possibility of building alternative clients (e.g., a mobile app) in the future without modifying the backend logic.

### Choice of Flask Over Heavier Frameworks
Flask was selected for its lightweight, "micro-framework" nature. For a project of this scope, a heavier, more opinionated framework like Django would introduce unnecessary complexity. Flask provides the core essentials for web development (routing, request handling) while allowing the developer to choose libraries and extensions for specific needs (e.g., SQLAlchemy for database access, PyJWT for authentication). This results in a smaller, more maintainable codebase.

### Choice of React + TypeScript
React is a popular and powerful library for building dynamic user interfaces. The choice of TypeScript adds static typing to JavaScript, which significantly improves developer productivity by catching errors at compile time, improving code completion, and making the codebase more self-documenting. This is particularly valuable for a project that is expected to grow and evolve.

### Why SQLite Relational DB Used
For the initial version of LOOP, SQLite was chosen as the database for its simplicity and ease of setup. It is a serverless, file-based database that requires no additional configuration, making it ideal for local development and small-scale deployments. The relational model was chosen to enforce data integrity and provide a structured way to manage the relationships between users, projects, and feedback.

### JWT Authentication Design
Authentication is handled using JSON Web Tokens (JWT). When a user logs in, the backend generates a signed JWT containing the user's ID and an expiration timestamp. This token is sent to the frontend and stored locally. For subsequent requests to protected endpoints, the frontend includes the JWT in the `Authorization` header. The backend validates the token's signature and expiration to authenticate the user, making the authentication process stateless and scalable.

## DATABASE DESIGN (VERY DETAILED)

The database schema is designed to be relational, ensuring data integrity and providing a clear structure for the application's data.

### Users Table
- `id`: Primary Key, Integer.
- `email`: Unique, String. Stores the user's email address.
- `password_hash`: String. Stores the hashed and salted password.
- `created_at`: DateTime. Timestamp of when the user account was created.

### Projects Table
- `id`: Primary Key, Integer.
- `name`: String. The name of the project.
- `description`: String. A brief description of the project.
- `product_url`: String. The URL of the product being tested.
- `public_slug`: Unique, String. A publicly-accessible, URL-safe identifier for the project.
- `feedback_expiry_days`: Integer. The number of days the public feedback link is valid.
- `user_id`: Foreign Key (Users.id). Establishes the ownership of the project.
- `created_at`: DateTime. Timestamp of when the project was created.
- `expiry_date`: DateTime. The calculated date and time when the feedback link expires.

### Feedback Table
- `id`: Primary Key, Integer.
- `type`: String (Enum: 'BUG', 'IDEA', 'OTHER'). The type of feedback.
- `description`: String. The detailed feedback submitted by the user.
- `status`: String (Enum: 'NEW', 'ACCEPTED', 'REJECTED', 'RESOLVED'). The current status of the feedback.
- `project_id`: Foreign Key (Projects.id). Links the feedback to a specific project.
- `created_at`: DateTime. Timestamp of when the feedback was submitted.

### FeedbackStatusHistory Table
- `id`: Primary Key, Integer.
- `feedback_id`: Foreign Key (Feedback.id). Links the history entry to a specific piece of feedback.
- `status`: String. The status being transitioned to.
- `notes`: String. Optional notes explaining the status change (mandatory for some transitions).
- `changed_at`: DateTime. Timestamp of when the status change occurred.

### Relationships and Constraints
- **Users to Projects:** One-to-many. A user can have multiple projects, but each project belongs to one user.
- **Projects to Feedback:** One-to-many. A project can have multiple pieces of feedback, but each piece of feedback belongs to one project.
- **Feedback to FeedbackStatusHistory:** One-to-many. Each piece of feedback can have multiple status history entries, creating an audit trail.
- **Referential Integrity:** The use of foreign key constraints ensures that, for example, a project cannot be deleted if it still has associated feedback, preventing orphaned records.

### Why Relational DB Chosen
A relational database was chosen to enforce a strict schema and maintain data consistency. The relationships between users, projects, and feedback are well-defined and benefit from the referential integrity provided by a relational model. This structure makes it easier to query the data in complex ways, such as retrieving all feedback for a given project or all projects for a given user.

### Future PostgreSQL Migration Considerations
While SQLite is sufficient for the current scale, a migration to a more robust, server-based RDBMS like PostgreSQL is planned for the future. PostgreSQL offers better concurrency, performance, and scalability, making it suitable for a production environment with multiple concurrent users. The use of SQLAlchemy as an ORM will simplify this migration, as it abstracts away the underlying database-specific SQL dialects.

## AUTHENTICATION FLOW

### Signup Flow
1. The user provides an email and password on the frontend.
2. The frontend sends a POST request to the `/auth/register` endpoint.
3. The backend validates the input, checks if the email is already in use, hashes the password, and creates a new user in the database.
4. Upon successful registration, the user is redirected to the login page.

### Login Flow
1. The user provides their email and password.
2. The frontend sends a POST request to the `/auth/login` endpoint.
3. The backend verifies the credentials. If they are valid, it generates a JWT containing the user's ID and an expiration date.
4. The JWT is sent back to the frontend, which stores it in `localStorage` and redirects the user to the dashboard.

### JWT Handling
For every subsequent request to a protected API route, the frontend includes the JWT in the `Authorization` header as a Bearer token. The backend uses a decorator to intercept these requests, validate the token, and extract the user's ID, making it available to the route handler.

### Protected Route Logic
- **Backend:** A `@jwt_required()` decorator is applied to all routes that require authentication. If the token is missing, invalid, or expired, the API returns a `401 Unauthorized` error.
- **Frontend:** A "private route" component checks for the presence of a valid token in `localStorage`. If the token is not present, the user is redirected to the login page.

### Security Considerations
- **Password Hashing:** Passwords are never stored in plaintext. They are hashed and salted using a strong, one-way hashing algorithm.
- **JWT Signature:** The JWT is signed with a secret key known only to the server, preventing tampering.
- **Token Expiration:** JWTs have a limited lifetime, reducing the window of opportunity for an attacker to use a stolen token.
- **HTTPS:** In a production environment, all communication must be over HTTPS to prevent token interception.

## PROJECT CREATION FLOW

### How Projects are Created
1. An authenticated user fills out a form on the dashboard with the project's name, description, product URL, and desired feedback expiry period (in days).
2. The frontend sends a POST request to the `/project` endpoint with this data.
3. The backend validates the input, generates a unique public slug, calculates the expiry date, and creates a new project record associated with the authenticated user's ID.

### Slug Generation
A unique, URL-safe `public_slug` is generated for each project. This is a short, random string that is used in the public URL for feedback submission. A loop ensures that the generated slug does not already exist in the database, guaranteeing uniqueness.

### Expiry Calculation Logic
The `expiry_date` is calculated by adding the `feedback_expiry_days` provided by the user to the current timestamp (`created_at`). This value is stored in the database and used to enforce the feedback submission deadline.

### Ownership Enforcement
All project-related API endpoints that perform mutations (e.g., creating, updating, deleting projects or managing feedback) are protected and enforce ownership. The backend ensures that the authenticated user making the request is the owner of the project in question, preventing unauthorized access.

## PUBLIC FEEDBACK FLOW

### Public Link Access
A user with the public link (`/public/{public_slug}`) can access the feedback submission page for a project without needing to be authenticated.

### Feedback Submission Validation
1. The user selects a feedback type ('BUG', 'IDEA', 'OTHER') and provides a description.
2. The frontend sends a POST request to the `/public/{public_slug}/feedback` endpoint.
3. The backend first looks up the project by its `public_slug`. If the project doesn't exist or the `expiry_date` has passed, it returns an error.
4. If the project is valid and active, the backend validates the feedback data, creates a new feedback record with a default status of 'NEW', and associates it with the project.

### Expiry Enforcement Logic
Before creating a new feedback record, the backend explicitly checks if `datetime.utcnow()` is greater than the project's `expiry_date`. If it is, feedback submission is blocked, and an error is returned to the user, informing them that the feedback period has ended.

### Handling Anonymous Users
The public feedback submission process is entirely anonymous. No personally identifiable information is collected from the person submitting the feedback. The focus is on the content of the feedback itself, not on who provided it.

## FEEDBACK LIFECYCLE MANAGEMENT

The feedback lifecycle is managed as a simple state machine, ensuring that feedback moves through a logical and predictable workflow.

### State Transitions
- **NEW → ACCEPTED:** The project owner acknowledges the feedback and plans to act on it.
- **ACCEPTED → RESOLVED:** The bug has been fixed, or the idea has been implemented.
- **NEW → REJECTED:** The project owner decides not to act on the feedback.

### Validation Rules
- **Immutability of 'REJECTED' and 'RESOLVED':** Once feedback is moved to 'REJECTED' or 'RESOLVED', its state cannot be changed further. These are terminal states.
- **Mandatory Resolution Notes:** A transition to 'RESOLVED' or 'REJECTED' requires the project owner to provide notes explaining the decision. This ensures transparency and provides context for the final status.

### Why Original Feedback is Immutable
The original feedback (`type` and `description`) is immutable. It cannot be edited by the project owner. This preserves the integrity of the user's original submission and ensures that the feedback is not misinterpreted or altered as it moves through the lifecycle.

## STATUS HISTORY SYSTEM

### Audit Trail Importance
A complete audit trail of all status changes is crucial for accountability and observability. It allows project owners to see how and when a piece of feedback was processed, who made the changes (in a future multi-user scenario), and why.

### History Table Design
The `FeedbackStatusHistory` table is designed to capture every status change. Each time a feedback item's status is updated, a new row is created in this table, storing the `feedback_id`, the new `status`, any associated `notes`, and a `timestamp`.

### Timeline Representation
This historical data can be used to render a timeline view on the frontend, showing the complete journey of a piece of feedback from submission to resolution. This provides a clear and chronological record of the feedback's lifecycle.

### Observability Benefits
The status history system provides deep observability into the feedback management process. It can be used to diagnose issues, track team performance (e.g., time to resolution), and identify bottlenecks in the feedback processing workflow.

## BACKEND STRUCTURE

The Flask backend is organized into a modular structure to promote separation of concerns and maintainability.

- **`models/`**: Contains the SQLAlchemy data models, defining the database schema.
- **`routes/`**: Contains the Flask Blueprints for different parts of the API (e.g., `auth`, `project`, `feedback`). Each blueprint defines a set of related routes.
- **`services/`**: Contains business logic that is decoupled from the route handlers (e.g., a service for managing feedback state transitions).
- **`config/`**: Contains configuration files and settings for the application.
- **`app.py`**: The main application entry point, responsible for creating the Flask app instance, registering blueprints, and initializing extensions.

### Why Modular Structure Chosen
This modular structure, often referred to as the "application factory" pattern, makes the application easier to test, maintain, and scale. By separating concerns, it's easier to find and modify code, and the use of Blueprints allows the application to be broken down into smaller, more manageable components.

## FRONTEND STRUCTURE

The React frontend is structured to separate concerns and promote reusability.

- **`pages/`**: Contains the top-level components that correspond to different pages or routes in the application (e.g., `LoginPage`, `DashboardPage`).
- **`components/`**: Contains reusable UI components that are used across multiple pages (e.g., `Navbar`, `CreateProjectForm`).
- **`services/`**: Contains modules for interacting with external services, such as the backend API. An `axios` instance is configured here.
- **`types/`**: Contains TypeScript type definitions and interfaces, providing static typing for data structures like `Project` and `Feedback`.

### State Handling Decisions
For this application, local component state managed with React's `useState` and `useEffect` hooks is sufficient. A more complex global state management library like Redux was intentionally avoided because the application's state is relatively simple and primarily consists of data fetched from the API. Avoiding Redux reduces boilerplate and complexity.

### Dashboard UX Reasoning
The dashboard is designed to be the central hub for project owners. It provides an at-a-glance view of all projects and makes it easy to create new ones. The user experience is optimized for a quick workflow, allowing users to create a project and get a shareable link in just a few clicks.

## ERROR HANDLING

### API Error Format
The backend API returns errors in a consistent JSON format:
`{ "error": "A descriptive error message" }`
This allows the frontend to easily parse and display error messages to the user.

### Validation Failures
Input validation failures (e.g., an invalid email format) result in a `400 Bad Request` response with a clear error message indicating which field is invalid and why.

### Edge Case Handling
The system is designed to handle various edge cases, such as:
- Attempting to access a project that doesn't exist.
- Submitting feedback to an expired link.
- Attempting an invalid feedback status transition.

In each case, the API returns an appropriate HTTP status code and a descriptive error message.

## TESTING STRATEGY

The testing strategy focuses on unit and integration tests to ensure the correctness of the business logic. Key test cases include:
- **Invalid Transition Test:** Asserting that the system rejects invalid feedback status transitions (e.g., from 'RESOLVED' back to 'NEW').
- **Expiry Test:** Asserting that feedback submission is blocked for expired projects.
- **Resolution Note Enforcement:** Asserting that a transition to 'RESOLVED' or 'REJECTED' fails if no notes are provided.

## OBSERVABILITY

### Logging Strategy
The backend uses Python's built-in `logging` module to log key events, such as application startup, database queries, and error conditions. In a production environment, these logs would be aggregated and sent to a centralized logging service for analysis and alerting.

### Diagnosing Failures
Detailed error logs and consistent API error responses are the primary tools for diagnosing failures. The combination of a descriptive error message, a stack trace (in the logs), and a unique request ID (in a production system) makes it possible to quickly identify and resolve issues.

### Status Change Visibility
The `FeedbackStatusHistory` table provides complete visibility into the feedback lifecycle, making it easy to see who changed what and when. This is a key aspect of the system's observability.

## AI ASSISTED DEVELOPMENT

This project, including this documentation, was developed with the assistance of a large language model (LLM).

### AI Tools Used
The primary AI tool used was a state-of-the-art LLM integrated into the development environment.

### Prompt Engineering Strategy
The development process involved a conversational interaction with the LLM. Prompts were used to:
- **Scaffold the initial project structure.**
- **Generate boilerplate code for Flask routes and React components.**
- **Write complex business logic based on high-level descriptions.**
- **Generate this detailed technical documentation.**

Prompts were designed to be specific and context-aware, providing the LLM with clear instructions and examples.

### Validation Approach
All code and documentation generated by the LLM were carefully reviewed, tested, and refined by a human developer. The LLM was treated as a powerful productivity tool, not as an infallible authority. Manual validation was essential to ensure the correctness, security, and quality of the final product.

### Manual Refinements
Significant manual refinements were made to the AI-generated output, including:
- **Refactoring code for clarity and maintainability.**
- **Adding detailed comments and docstrings.**
- **Customizing the UI and UX of the frontend.**
- **Expanding and clarifying the technical documentation.**

### Risks of AI Usage
- **Subtle Bugs:** LLMs can sometimes generate code that appears correct but contains subtle bugs or security vulnerabilities.
- **"Hallucinations":** LLMs can occasionally generate plausible-sounding but incorrect information.
- **Over-reliance:** Relying too heavily on the LLM without proper validation can lead to a decrease in code quality.

### Safeguards Used
- **Human Oversight:** Every line of AI-generated code was reviewed by a human expert.
- **Testing:** A comprehensive testing strategy was used to validate the correctness of the business logic.
- **Iterative Refinement:** The development process was iterative, with the LLM's output being continuously refined and improved.

## TRADEOFFS AND LIMITATIONS

- **SQLite Limitations:** SQLite is not suitable for large-scale, high-concurrency applications. A migration to a more robust database will be necessary for production use.
- **Lack of Team Collaboration Features:** The current version of LOOP is designed for single users. It lacks features for team collaboration, such as inviting team members to a project or assigning feedback to different people.
- **Local Deployment Constraints:** The current setup is designed for local development. A production deployment would require additional configuration, including a production-grade WSGI server (e.g., Gunicorn), a reverse proxy (e.g., Nginx), and a more robust database.
- **Scalability Considerations:** While the stateless nature of the backend and the separation of the frontend and backend provide a good foundation for scalability, a large-scale deployment would require a more sophisticated infrastructure, including load balancing and potentially a container orchestration system like Kubernetes.

## FUTURE IMPROVEMENTS

- **Team Collaboration:** Add the ability to invite multiple users to a project and assign feedback.
- **Notifications:** Implement email or in-app notifications for key events, such as new feedback submissions or status changes.
- **Advanced Reporting:** Build a reporting dashboard with metrics on feedback volume, resolution times, and common themes.
- **Integrations:** Integrate with popular project management tools like Jira and Trello.
- **Rich Text and Attachments:** Allow users to submit feedback with rich text formatting and file attachments (e.g., screenshots).
- **PostgreSQL Migration:** Migrate the database to PostgreSQL to support production-level workloads.
