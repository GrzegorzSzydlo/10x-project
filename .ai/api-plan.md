# REST API Plan

This document outlines the design for the RESTful API for the ProjectFlow application, based on the provided database schema, product requirements (PRD), and technical stack. The API will be implemented using Astro Server Endpoints and will interact with a Supabase backend.

## 1. Resources

The API is built around the following core resources, which map directly to the database tables:

- **Users**: Represents user profiles. Mapped to `public.users`.
- **Projects**: Represents projects created by users. Mapped to `public.projects`.
- **Project Members**: Manages the relationship between users and projects. Mapped to `public.project_members`.
- **Milestones**: Represents project milestones. Mapped to `public.milestones`.
- **Tasks**: Represents tasks and sub-tasks within a project. Mapped to `public.tasks`.
- **Task History**: Logs changes made to tasks. Mapped to `public.task_history`.

## 2. Endpoints

All endpoints are prefixed with `/api`.

### 2.1. Users

#### `GET /users`

- **Description**: Retrieves a list of all users in the system. This is an admin-only endpoint.
- **Query Parameters**:
  - `page` (number, optional): Page number for pagination.
  - `limit` (number, optional): Number of items per page.
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "first_name": "string",
        "last_name": "string",
        "avatar_url": "string",
        "role": "team_member"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the authenticated user is not an administrator.

#### `PATCH /users/{userId}/role`

- **Description**: Updates the role of a specific user. This is an admin-only endpoint.
- **Request Body**:
  ```json
  {
    "role": "project_manager"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "avatar_url": "string",
    "role": "project_manager"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If the request body is invalid or the role is not a valid `user_role`.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the authenticated user is not an administrator.
  - `404 Not Found`: If the user with the specified `userId` does not exist.

### 2.2. Projects

#### `GET /projects`

- **Description**: Retrieves a list of projects the authenticated user is a member of.
- **Query Parameters**:
  - `page` (number, optional): Page number for pagination.
  - `limit` (number, optional): Number of items per page.
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "owner_id": "uuid",
        "created_at": "timestamptz"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

#### `POST /projects`

- **Description**: Creates a new project. The creator is automatically assigned as the owner and a project member. Requires `project_manager` or `administrator` role.
- **Request Body**:
  ```json
  {
    "name": "New Marketing Campaign"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "uuid",
    "name": "New Marketing Campaign",
    "owner_id": "uuid",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If the `name` is missing or invalid.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a Project Manager or Administrator.

#### `GET /projects/{projectId}`

- **Description**: Retrieves the details of a specific project.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "owner_id": "uuid",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the project.
  - `404 Not Found`: If the project does not exist.

### 2.3. Project Members

#### `GET /projects/{projectId}/members`

- **Description**: Retrieves a list of members for a specific project.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "user_id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "avatar_url": "string",
      "role": "team_member"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the project.
  - `404 Not Found`: If the project does not exist.

#### `POST /projects/{projectId}/members`

- **Description**: Adds a user to a project. Requires `project_manager` or `administrator` role for the project.
- **Request Body**:
  ```json
  {
    "user_id": "uuid"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "project_id": "uuid",
    "user_id": "uuid",
    "created_at": "timestamptz"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If `user_id` is missing or the user is already a member.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a manager of the project.
  - `404 Not Found`: If the project or user does not exist.

#### `DELETE /projects/{projectId}/members/{userId}`

- **Description**: Removes a user from a project. Requires `project_manager` or `administrator` role for the project.
- **Success Response (204 No Content)**:
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a manager of the project.
  - `404 Not Found`: If the project, user, or membership does not exist.

### 2.4. Milestones

#### `GET /projects/{projectId}/milestones`

- **Description**: Retrieves all milestones for a specific project.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "project_id": "uuid",
      "name": "string",
      "description": "string",
      "due_date": "date",
      "created_at": "timestamptz"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the project.
  - `404 Not Found`: If the project does not exist.

#### `POST /projects/{projectId}/milestones`

- **Description**: Creates a new milestone in a project. Requires `project_manager` or `administrator` role.
- **Request Body**:
  ```json
  {
    "name": "Q4 Launch",
    "description": "Tasks related to the Q4 product launch.",
    "due_date": "2025-12-31"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "Q4 Launch",
    "description": "Tasks related to the Q4 product launch.",
    "due_date": "2025-12-31",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If the request body is invalid.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a manager of the project.
  - `404 Not Found`: If the project does not exist.

### 2.5. Tasks

#### `GET /projects/{projectId}/tasks`

- **Description**: Retrieves all tasks for a project, formatted for the Kanban board.
- **Query Parameters**:
  - `assignee_id` (uuid, optional): Filter tasks by the assigned user's ID.
  - `milestone_id` (uuid, optional): Filter tasks by the milestone ID.
- **Success Response (200 OK)**:
  ```json
  {
    "To Do": [
      {
        "id": "uuid",
        "title": "string",
        "assignee_id": "uuid",
        "parent_task_id": null,
        "display_order": 1.0
      }
    ],
    "In Progress": [],
    "Testing": [],
    "Done": []
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the project.
  - `404 Not Found`: If the project does not exist.

#### `POST /projects/{projectId}/tasks`

- **Description**: Creates a new task or subtask in a project.
- **Request Body**:
  ```json
  {
    "title": "Design new logo",
    "description": "string",
    "assignee_id": "uuid",
    "milestone_id": "uuid",
    "parent_task_id": "uuid", // optional, for creating a subtask
    "due_date": "timestamptz"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "uuid",
    "project_id": "uuid",
    "title": "Design new logo",
    "description": "string",
    "status": "To Do",
    "assignee_id": "uuid",
    "milestone_id": "uuid",
    "parent_task_id": "uuid",
    "due_date": "timestamptz",
    "display_order": 1.0,
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If the request body is invalid.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the project.
  - `404 Not Found`: If the project does not exist.

#### `PATCH /tasks/{taskId}`

- **Description**: Updates a task's details, status, or display order.
- **Request Body** (any combination of fields is allowed):
  ```json
  {
    "title": "string",
    "description": "string",
    "assignee_id": "uuid",
    "milestone_id": "uuid",
    "due_date": "timestamptz",
    "status": "In Progress",
    "display_order": 2.5
  }
  ```
- **Success Response (200 OK)**: Returns the updated task object.
- **Error Responses**:
  - `400 Bad Request`: If the request body is invalid or a business rule is violated (e.g., moving a parent task to 'Done' while subtasks are incomplete).
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the task's project.
  - `404 Not Found`: If the task does not exist.

#### `GET /tasks/{taskId}/history`

- **Description**: Retrieves the change history for a specific task.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "bigint",
      "user_id": "uuid",
      "changed_field": "status",
      "old_value": "To Do",
      "new_value": "In Progress",
      "changed_at": "timestamptz"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user is not a member of the task's project.
  - `404 Not Found`: If the task does not exist.

## 3. Authentication and Authorization

- **Authentication**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Auth. The client will send the JWT in the `Authorization` header of each request (`Authorization: Bearer <supabase-jwt>`). Astro middleware will be used to verify the token and attach the user session to the request context (`Astro.locals`).

- **Authorization**: Authorization will be enforced at two levels:
  1.  **Role-Based Access Control (RBAC)**: API endpoints will check the user's role (`administrator`, `project_manager`, `team_member`) from the `users` table to grant access to specific operations (e.g., creating projects, changing roles).
  2.  **Row-Level Security (RLS)**: PostgreSQL RLS policies, as defined in the database plan, will provide the primary layer of data security. These policies ensure that users can only access or modify data within the projects they are members of. API logic will rely on RLS to automatically filter data, simplifying the backend code.

## 4. Validation and Business Logic

- **Input Validation**: All incoming request bodies and query parameters will be validated using `zod`. Schemas will be defined for each endpoint to ensure data integrity and type safety, matching the constraints from the database schema (e.g., `NOT NULL`, data types).

- **Business Logic Implementation**:
  - **Task Reordering**: The `display_order` field (a `DOUBLE PRECISION` number) will be used to manage task priority within a Kanban column. When a task is moved, the client can calculate a new `display_order` value between its new neighbors and send it in a `PATCH /tasks/{taskId}` request.
  - **Subtask Completion Rule**: The `PATCH /tasks/{taskId}` endpoint will contain logic to check if a task has any incomplete subtasks. If a user attempts to set the parent task's status to `Done` while subtasks are not `Done`, the API will return a `400 Bad Request` with an explanatory error message.
  - **Task History Logging**: A database trigger (`on_task_update_log_history`) will automatically create a new entry in the `task_history` table whenever a task's `status` or `assignee_id` is changed. This offloads the logic from the API layer.
  - **Automatic `updated_at`**: A generic database trigger (`handle_updated_at`) will automatically update the `updated_at` timestamp on all relevant tables, ensuring data consistency without explicit API logic.
