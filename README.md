# ProjectFlow
Have Fun ;) 

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

ProjectFlow is a web application designed to streamline project management for small and medium-sized teams. It aims to centralize work planning by providing a simple yet powerful interface for creating task hierarchies, managing milestones, and visually tracking progress on a Kanban board. The primary goal is to provide a single, coherent source of truth for project status, moving teams away from scattered and inefficient planning methods.

## Tech Stack

This project is built with a modern, component-based architecture.

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/)
- **Testing (Unit & Integration)**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/react)
- **Testing (E2E)**: [Playwright](https://playwright.dev/)
- **Node.js Version**: 22.14.0

## Getting Started Locally

To set up and run this project on your local machine, follow these steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed. It is recommended to use a version manager like [nvm](https://github.com/nvm-sh/nvm) to ensure you are using the correct version specified in the `.nvmrc` file.

```bash
nvm use
```

### Installation

1.  Clone the repository to your local machine:

    ```bash
    git clone https://github.com/your-username/projectflow.git
    cd projectflow
    ```

2.  Install the project dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

Start the local development server with hot-reloading enabled:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

## Available Scripts

This project includes the following scripts defined in `package.json`:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Serves the production build locally for previewing.
- `npm run lint`: Lints the codebase for errors and style issues.
- `npm run lint:fix`: Automatically fixes linting issues.
- `npm run format`: Formats the code using Prettier.

## Project Scope

The MVP (Minimum Viable Product) of ProjectFlow focuses on delivering the core features necessary for effective project management.

### Key Features

- **Role-Based Access Control**: Three user roles (`Administrator`, `Project Manager`, `Team Member`) with distinct permissions.
- **Project Management**: Create projects and manage team member access.
- **Task Hierarchy**: A two-level system supporting tasks and sub-tasks.
- **Kanban Board**: An interactive board with four fixed columns: `To Do`, `In Progress`, `Testing`, and `Done`.
- **Milestones**: Group tasks under larger project goals.
- **Filtering**: Filter the Kanban board by assigned user or milestone.
- **Task History**: A simple activity log for tracking changes to tasks.

### Out of Scope for MVP

The following features are intentionally excluded from the initial release but may be considered for future versions:

- Advanced notifications (e.g., Slack, email).
- In-app communication (chat, comments).
- Time tracking and reporting.
- Customizable user roles and permissions.
- Integrations with external calendars.
- Native mobile applications.
- Data import/export functionality.
- File attachments for tasks.

## Project Status

**In Development**

This project is currently in the development phase. The core features for the MVP are being actively built.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
