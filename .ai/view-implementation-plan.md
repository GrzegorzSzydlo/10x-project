# API Endpoint Implementation Plan: Project Views (Projects, Members, Milestones, Tasks)

## 1. Przegląd punktów końcowych

Ten plan obejmuje implementację kompleksowego zestawu REST API endpoints dla zarządzania projektami, członkami projektów, kamieniami milowymi i zadaniami. Endpoints te tworzą podstawę dla aplikacji do zarządzania projektami, umożliwiając:

- Pobieranie szczegółów projektów
- Zarządzanie członkami projektów (listowanie, dodawanie, usuwanie)
- Zarządzanie kamieniami milowymi (listowanie, tworzenie)
- Zarządzanie zadaniami (listowanie w formacie Kanban, tworzenie, aktualizacja, historia zmian)

Wszystkie endpoints wymagają uwierzytelnienia poprzez Supabase Auth i stosują Row Level Security (RLS) oraz dodatkowe sprawdzenia na poziomie aplikacji.

## 2. Szczegóły poszczególnych endpointów

### 2.1. GET /projects/{projectId}

**Metoda HTTP:** GET

**Struktura URL:** `/api/projects/[projectId]`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter) - identyfikator projektu

**Request Body:** Brak

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "string",
  "owner_id": "uuid",
  "created_at": "timestamptz",
  "updated_at": "timestamptz"
}
```

**Kody błędów:**

- 400: Nieprawidłowy format projectId
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu
- 404: Projekt nie istnieje

---

### 2.2. GET /projects/{projectId}/members

**Metoda HTTP:** GET

**Struktura URL:** `/api/projects/[projectId]/members`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)

**Request Body:** Brak

**Response (200 OK):**

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

**Kody błędów:**

- 400: Nieprawidłowy format projectId
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu
- 404: Projekt nie istnieje

---

### 2.3. POST /projects/{projectId}/members

**Metoda HTTP:** POST

**Struktura URL:** `/api/projects/[projectId]/members`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)

**Request Body:**

```json
{
  "user_id": "uuid"
}
```

**Response (201 Created):**

```json
{
  "project_id": "uuid",
  "user_id": "uuid",
  "created_at": "timestamptz"
}
```

**Kody błędów:**

- 400: Nieprawidłowy format danych, użytkownik już jest członkiem
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie ma uprawnień managera projektu
- 404: Projekt lub użytkownik nie istnieje

---

### 2.4. DELETE /projects/{projectId}/members/{userId}

**Metoda HTTP:** DELETE

**Struktura URL:** `/api/projects/[projectId]/members/[userId]`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)
  - `userId` (UUID, path parameter)

**Request Body:** Brak

**Response (204 No Content):** Brak body

**Kody błędów:**

- 400: Nieprawidłowy format parametrów
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie ma uprawnień managera projektu
- 404: Projekt, użytkownik lub członkostwo nie istnieje

---

### 2.5. GET /projects/{projectId}/milestones

**Metoda HTTP:** GET

**Struktura URL:** `/api/projects/[projectId]/milestones`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)

**Request Body:** Brak

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "string",
    "description": "string",
    "due_date": "date",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
]
```

**Kody błędów:**

- 400: Nieprawidłowy format projectId
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu
- 404: Projekt nie istnieje

---

### 2.6. POST /projects/{projectId}/milestones

**Metoda HTTP:** POST

**Struktura URL:** `/api/projects/[projectId]/milestones`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)

**Request Body:**

```json
{
  "name": "string",
  "description": "string (optional)",
  "due_date": "date (optional)"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "description": "string",
  "due_date": "date",
  "created_at": "timestamptz",
  "updated_at": "timestamptz"
}
```

**Kody błędów:**

- 400: Nieprawidłowy format danych
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie ma uprawnień managera projektu
- 404: Projekt nie istnieje

---

### 2.7. GET /projects/{projectId}/tasks

**Metoda HTTP:** GET

**Struktura URL:** `/api/projects/[projectId]/tasks`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)
- Opcjonalne:
  - `assignee_id` (UUID, query parameter)
  - `milestone_id` (UUID, query parameter)

**Request Body:** Brak

**Response (200 OK):**

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

**Kody błędów:**

- 400: Nieprawidłowy format parametrów
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu
- 404: Projekt nie istnieje

---

### 2.8. POST /projects/{projectId}/tasks

**Metoda HTTP:** POST

**Struktura URL:** `/api/projects/[projectId]/tasks`

**Parametry:**

- Wymagane:
  - `projectId` (UUID, path parameter)

**Request Body:**

```json
{
  "title": "string",
  "description": "string (optional)",
  "assignee_id": "uuid (optional)",
  "milestone_id": "uuid (optional)",
  "parent_task_id": "uuid (optional)",
  "due_date": "timestamptz (optional)"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "string",
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

**Kody błędów:**

- 400: Nieprawidłowy format danych
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu
- 404: Projekt nie istnieje

---

### 2.9. PATCH /tasks/{taskId}

**Metoda HTTP:** PATCH

**Struktura URL:** `/api/tasks/[taskId]`

**Parametry:**

- Wymagane:
  - `taskId` (UUID, path parameter)

**Request Body (wszystkie pola opcjonalne):**

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "assignee_id": "uuid (optional)",
  "milestone_id": "uuid (optional)",
  "due_date": "timestamptz (optional)",
  "status": "task_status (optional)",
  "display_order": "number (optional)"
}
```

**Response (200 OK):** Zwraca zaktualizowany obiekt zadania (TaskDetailsDto)

**Kody błędów:**

- 400: Nieprawidłowy format danych, naruszenie reguł biznesowych
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu zadania
- 404: Zadanie nie istnieje

---

### 2.10. GET /tasks/{taskId}/history

**Metoda HTTP:** GET

**Struktura URL:** `/api/tasks/[taskId]/history`

**Parametry:**

- Wymagane:
  - `taskId` (UUID, path parameter)

**Request Body:** Brak

**Response (200 OK):**

```json
[
  {
    "id": "bigint",
    "user_id": "uuid",
    "changed_field": "string",
    "old_value": "string",
    "new_value": "string",
    "changed_at": "timestamptz"
  }
]
```

**Kody błędów:**

- 400: Nieprawidłowy format taskId
- 401: Brak uwierzytelnienia
- 403: Użytkownik nie jest członkiem projektu zadania
- 404: Zadanie nie istnieje

## 3. Wykorzystywane typy

### DTOs (Data Transfer Objects)

```typescript
// Z types.ts
type ProjectDetailsDto = Project;

type ProjectMemberDto = Omit<UserDto, "id"> & {
  user_id: User["id"];
};

type MilestoneDto = Milestone;

type TaskCardDto = Pick<Task, "id" | "title" | "assignee_id" | "parent_task_id" | "display_order">;

type TaskDetailsDto = Task;

type TaskHistoryDto = Pick<TaskHistory, "id" | "user_id" | "changed_field" | "old_value" | "new_value" | "changed_at">;

type KanbanColumns = {
  [key in TaskStatus]: TaskCardDto[];
};
```

### Command Models

```typescript
// Z types.ts
type AddProjectMemberCommand = Pick<ProjectMember, "user_id">;

type CreateMilestoneCommand = Pick<Milestone, "name" | "description" | "due_date">;

type CreateTaskCommand = Pick<
  Task,
  "title" | "description" | "assignee_id" | "milestone_id" | "parent_task_id" | "due_date"
>;

type UpdateTaskCommand = Partial<
  Pick<Task, "title" | "description" | "assignee_id" | "milestone_id" | "due_date" | "status" | "display_order">
>;
```

### Zod Schemas (do utworzenia)

```typescript
// src/api/validation/projects.schemas.ts
import { z } from "zod";

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid(),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid(),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().uuid(),
});

export const addProjectMemberSchema = z.object({
  user_id: z.string().uuid(),
});

export const createMilestoneSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  milestone_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  milestone_id: z.string().uuid().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  status: z.enum(["To Do", "In Progress", "Testing", "Done"]).optional(),
  display_order: z.number().optional(),
});

export const tasksQuerySchema = z.object({
  assignee_id: z.string().uuid().optional(),
  milestone_id: z.string().uuid().optional(),
});
```

## 4. Przepływ danych

### Typowy przepływ dla endpointów GET:

1. **Middleware** (`src/middleware/index.ts`):
   - Weryfikuje JWT token z Supabase
   - Tworzy session i przypisuje do `Astro.locals.supabase`
   - Pobiera user info i przypisuje do `Astro.locals.user`

2. **Endpoint Handler** (np. `src/pages/api/projects/[projectId].ts`):
   - Waliduje parametry URL (projectId jako UUID)
   - Sprawdza czy użytkownik jest uwierzytelniony
   - Deleguje logikę do odpowiedniego serwisu

3. **Service Layer** (np. `src/lib/services/projects.service.ts`):
   - Sprawdza czy użytkownik jest członkiem projektu
   - Wykonuje query do Supabase (wykorzystując RLS)
   - Mapuje dane na odpowiednie DTO
   - Zwraca wynik lub rzuca błąd

4. **Response**:
   - Endpoint zwraca JSON z odpowiednim kodem statusu
   - W przypadku błędu zwraca odpowiedni kod i komunikat

### Typowy przepływ dla endpointów POST/PATCH/DELETE:

1-2. Jak w GET, plus:

- Waliduje request body używając Zod schemas
- Sprawdza uprawnienia (project_manager/administrator dla operacji modyfikujących)

3. **Service Layer**:
   - Sprawdza czy użytkownik ma odpowiednie uprawnienia
   - Wykonuje operację w bazie (INSERT/UPDATE/DELETE)
   - Dla PATCH /tasks/{taskId}: zapisuje zmiany w tabeli task_history
   - Mapuje dane na odpowiednie DTO
   - Zwraca wynik lub rzuca błąd

4. **Response**:
   - 201 dla CREATE
   - 200 dla UPDATE
   - 204 dla DELETE
   - W przypadku błędu odpowiedni kod i komunikat

## 5. Względy bezpieczeństwa

### Uwierzytelnianie

- **JWT Verification**: Middleware weryfikuje Supabase JWT token z nagłówka `Authorization: Bearer <token>`
- **Session Management**: Session przechowywany w `Astro.locals.user` zawiera user ID i role
- **Token Refresh**: Klient odpowiedzialny za odświeżanie tokenów przez Supabase SDK

### Autoryzacja

#### Poziom 1: Row Level Security (RLS) w Supabase

- Wszystkie tabele mają włączone RLS
- Polityki RLS zapewniają, że użytkownicy widzą tylko dane projektów, w których są członkami
- Polityki są zdefiniowane w migracjach SQL

#### Poziom 2: Application-Level Checks

- **Project Membership**: Każdy endpoint sprawdza czy `auth.uid()` jest w `project_members` dla danego projektu
- **Role-Based Access**: Endpoints modyfikujące (POST, PATCH, DELETE) sprawdzają czy user ma role `project_manager` lub `administrator`
- **Owner Verification**: Usuwanie projektu wymaga bycia właścicielem (`owner_id`)

### Walidacja Danych

- **Input Sanitization**: Wszystkie inputs walidowane przez Zod schemas przed przetworzeniem
- **UUID Validation**: Wszystkie ID weryfikowane jako prawidłowe UUIDs
- **Enum Validation**: Status, role walidowane według dozwolonych wartości z bazy
- **SQL Injection Prevention**: Wykorzystanie parametryzowanych zapytań przez Supabase SDK
- **XSS Prevention**: Dane zwracane jako JSON (Content-Type: application/json)

### Best Practices

1. **Use supabase from context**: Zawsze używaj `Astro.locals.supabase` zamiast importowania globalnego klienta
2. **Never expose sensitive data**: DTOs celowo pomijają wrażliwe pola (np. passwords, internal IDs)
3. **Rate Limiting**: Rozważ implementację rate limiting dla endpoints (przez Cloudflare lub middleware)
4. **CORS**: Skonfiguruj odpowiednie CORS headers dla produkcji
5. **Logging**: Loguj wszystkie błędy bez ujawniania szczegółów implementacji użytkownikowi

## 6. Obsługa błędów

### Struktura odpowiedzi błędu

Wszystkie błędy zwracają JSON w formacie:

```json
{
  "error": "Human-readable error message"
}
```

### Kategorie błędów

#### 400 Bad Request

**Przyczyny:**

- Nieprawidłowy format UUID w parametrach
- Brak wymaganych pól w request body
- Nieprawidłowe wartości enum (status, role)
- Nieprawidłowy format daty
- Duplikat członka projektu (POST /projects/{projectId}/members)
- Naruszenie reguł biznesowych (np. parent task w "Done" z incomplete subtasks)

**Implementacja:**

```typescript
if (!validation.success) {
  return new Response(JSON.stringify({ error: "Invalid input data" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
```

#### 401 Unauthorized

**Przyczyny:**

- Brak tokenu JWT w nagłówku Authorization
- Nieprawidłowy lub wygasły token
- Brak sesji użytkownika

**Implementacja:**

```typescript
const user = Astro.locals.user;
if (!user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
```

#### 403 Forbidden

**Przyczyny:**

- Użytkownik nie jest członkiem projektu
- Użytkownik nie ma wymaganych uprawnień (project_manager/administrator)
- Próba modyfikacji zasobu bez odpowiednich praw

**Implementacja:**

```typescript
const isMember = await projectsService.isProjectMember(projectId, user.id, supabase);
if (!isMember) {
  return new Response(JSON.stringify({ error: "Access denied" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
```

#### 404 Not Found

**Przyczyny:**

- Projekt nie istnieje
- Zadanie nie istnieje
- Użytkownik nie istnieje
- Kamień milowy nie istnieje
- Członkostwo nie istnieje (DELETE endpoint)

**Implementacja:**

```typescript
const project = await projectsService.getProjectById(projectId, supabase);
if (!project) {
  return new Response(JSON.stringify({ error: "Project not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
```

#### 500 Internal Server Error

**Przyczyny:**

- Błędy bazy danych
- Nieoczekiwane wyjątki
- Błędy konfiguracji

**Implementacja:**

```typescript
try {
  // ... operation
} catch (error) {
  console.error("Error in endpoint:", error);
  return new Response(JSON.stringify({ error: "Internal server error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
```

### Strategia obsługi błędów w Services

Services powinny:

1. Rzucać specyficzne błędy z komunikatami
2. NIE zwracać Response objects (to domena endpoint handlers)
3. Pozwalać błędom Supabase propagować się wyżej

```typescript
// src/lib/services/projects.service.ts
export async function getProjectById(projectId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}
```

## 7. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

1. **N+1 Query Problem**
   - Problem: Pobieranie członków projektu z ich szczegółami
   - Rozwiązanie: Użycie JOIN lub `.select("*, users(*)")` w Supabase

2. **Large Result Sets**
   - Problem: Projekty z tysiącami zadań
   - Rozwiązanie: Implementacja paginacji (limit/offset) lub cursor-based pagination

3. **Complex Kanban Queries**
   - Problem: Grupowanie zadań po statusie + filtrowanie
   - Rozwiązanie: Optymalizacja przez indeksy w bazie (`project_id, status`) - już zdefiniowane w db-plan

4. **Task History Growth**
   - Problem: Tabela task_history może rosnąć bardzo szybko
   - Rozwiązanie: Paginacja, archiwizacja starych wpisów, indeksy na task_id

### Strategie optymalizacji

#### Database Level

1. **Wykorzystanie istniejących indeksów:**
   - `tasks(project_id)` - szybkie filtrowanie po projekcie
   - `tasks(project_id, status)` - optymalizacja Kanban board
   - `task_history(task_id)` - szybkie pobieranie historii

2. **Selective Field Selection:**

   ```typescript
   // Zamiast select("*")
   .select("id, name, owner_id, created_at, updated_at")
   ```

3. **Count Optimization:**
   - Użycie `.select("*", { count: "exact", head: true })` dla count-only queries

#### Application Level

1. **Response Compression:**
   - Włączenie gzip compression w Astro config dla produkcji

2. **Caching Strategy:**
   - Rozważenie cache dla rzadko zmieniających się danych (project details)
   - HTTP Cache headers (`Cache-Control`, `ETag`)

3. **Pagination:**

   ```typescript
   // Dla dużych zbiorów danych
   const page = Number(url.searchParams.get("page")) || 1;
   const limit = Number(url.searchParams.get("limit")) || 50;
   const offset = (page - 1) * limit;

   const { data, count } = await supabase
     .from("tasks")
     .select("*", { count: "exact" })
     .range(offset, offset + limit - 1);
   ```

4. **Parallel Requests:**
   - Gdy frontend potrzebuje wielu zasobów, rozważ endpoint zwracający więcej danych naraz
   - Lub użycie `Promise.all()` po stronie klienta

#### Network Level

1. **Minimize Payload Size:**
   - DTOs zawierają tylko potrzebne pola
   - Rozważ różne DTOs dla list vs details views

2. **HTTP/2:**
   - Upewnij się, że hosting (Cloudflare Pages) wspiera HTTP/2

3. **CDN:**
   - Static assets przez Cloudflare CDN
   - API responses za geographic routing

## 8. Etapy wdrożenia

### Faza 1: Struktura projektu i typy

1. **Utworzenie struktury katalogów**

   ```
   src/
   ├── api/
   │   ├── services/        # Business logic
   │   └── validation/      # Zod schemas
   ├── pages/
   │   └── api/
   │       ├── projects/
   │       │   └── [projectId]/
   │       │       ├── index.ts
   │       │       ├── members/
   │       │       │   ├── index.ts
   │       │       │   └── [userId].ts
   │       │       ├── milestones/
   │       │       │   └── index.ts
   │       │       └── tasks/
   │       │           └── index.ts
   │       └── tasks/
   │           └── [taskId]/
   │               ├── index.ts
   │               └── history.ts
   ```

2. **Utworzenie Zod schemas w `src/api/validation/`**
   - `projects.schemas.ts` - wszystkie schemas związane z projektami, członkami, milestones, tasks
   - Schemas zgodnie z sekcją "3. Wykorzystywane typy"

3. **Weryfikacja typów w `src/types.ts`**
   - Upewnić się, że wszystkie DTOs i Command Models są zdefiniowane
   - Jeśli brakuje, dodać zgodnie z planem

### Faza 2: Service Layer

4. **Utworzenie `src/api/services/projects.service.ts`**

   ```typescript
   import type { SupabaseClient } from "@/db/supabase.client";
   import type { ProjectDetailsDto } from "@/types";

   export async function getProjectById(
     projectId: string,
     supabase: SupabaseClient
   ): Promise<ProjectDetailsDto | null> {
     const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();

     if (error) {
       if (error.code === "PGRST116") return null; // Not found
       throw error;
     }

     return data;
   }

   export async function isProjectMember(
     projectId: string,
     userId: string,
     supabase: SupabaseClient
   ): Promise<boolean> {
     const { data, error } = await supabase
       .from("project_members")
       .select("user_id")
       .eq("project_id", projectId)
       .eq("user_id", userId)
       .single();

     return !!data && !error;
   }
   ```

5. **Utworzenie `src/api/services/members.service.ts`**

   ```typescript
   import type { SupabaseClient } from "@/db/supabase.client";
   import type { ProjectMemberDto, AddProjectMemberCommand } from "@/types";

   export async function getProjectMembers(projectId: string, supabase: SupabaseClient): Promise<ProjectMemberDto[]> {
     const { data, error } = await supabase
       .from("project_members")
       .select(
         `
         user_id,
         users!inner (
           first_name,
           last_name,
           avatar_url,
           role
         )
       `
       )
       .eq("project_id", projectId);

     if (error) throw error;

     return data.map((item) => ({
       user_id: item.user_id,
       first_name: item.users.first_name,
       last_name: item.users.last_name,
       avatar_url: item.users.avatar_url,
       role: item.users.role,
     }));
   }

   export async function addProjectMember(
     projectId: string,
     command: AddProjectMemberCommand,
     supabase: SupabaseClient
   ) {
     const { data, error } = await supabase
       .from("project_members")
       .insert({
         project_id: projectId,
         user_id: command.user_id,
       })
       .select()
       .single();

     if (error) {
       if (error.code === "23505") {
         // Unique violation
         throw new Error("User is already a member of this project");
       }
       throw error;
     }

     return data;
   }

   export async function removeProjectMember(
     projectId: string,
     userId: string,
     supabase: SupabaseClient
   ): Promise<void> {
     const { error } = await supabase
       .from("project_members")
       .delete()
       .eq("project_id", projectId)
       .eq("user_id", userId);

     if (error) throw error;
   }

   export async function isProjectManager(
     projectId: string,
     userId: string,
     supabase: SupabaseClient
   ): Promise<boolean> {
     const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();

     if (!user) return false;

     // Administrator ma zawsze dostęp
     if (user.role === "administrator") return true;

     // Project manager musi być członkiem projektu
     if (user.role === "project_manager") {
       return await isProjectMember(projectId, userId, supabase);
     }

     return false;
   }
   ```

6. **Utworzenie `src/api/services/milestones.service.ts`**

   ```typescript
   import type { SupabaseClient } from "@/db/supabase.client";
   import type { MilestoneDto, CreateMilestoneCommand } from "@/types";

   export async function getProjectMilestones(projectId: string, supabase: SupabaseClient): Promise<MilestoneDto[]> {
     const { data, error } = await supabase
       .from("milestones")
       .select("*")
       .eq("project_id", projectId)
       .order("due_date", { ascending: true, nullsFirst: false });

     if (error) throw error;
     return data || [];
   }

   export async function createMilestone(
     projectId: string,
     command: CreateMilestoneCommand,
     supabase: SupabaseClient
   ): Promise<MilestoneDto> {
     const { data, error } = await supabase
       .from("milestones")
       .insert({
         project_id: projectId,
         name: command.name,
         description: command.description,
         due_date: command.due_date,
       })
       .select()
       .single();

     if (error) {
       if (error.code === "23505") {
         // Unique violation
         throw new Error("Milestone with this name already exists in the project");
       }
       throw error;
     }

     return data;
   }
   ```

7. **Utworzenie `src/api/services/tasks.service.ts`**

   ```typescript
   import type { SupabaseClient } from "@/db/supabase.client";
   import type {
     TaskCardDto,
     TaskDetailsDto,
     KanbanColumns,
     CreateTaskCommand,
     UpdateTaskCommand,
     TaskHistoryDto,
     TaskStatus,
   } from "@/types";

   export async function getProjectTasks(
     projectId: string,
     filters: { assignee_id?: string; milestone_id?: string },
     supabase: SupabaseClient
   ): Promise<KanbanColumns> {
     let query = supabase
       .from("tasks")
       .select("id, title, assignee_id, parent_task_id, display_order, status")
       .eq("project_id", projectId)
       .order("display_order", { ascending: true });

     if (filters.assignee_id) {
       query = query.eq("assignee_id", filters.assignee_id);
     }

     if (filters.milestone_id) {
       query = query.eq("milestone_id", filters.milestone_id);
     }

     const { data, error } = await query;

     if (error) throw error;

     // Group by status
     const kanban: KanbanColumns = {
       "To Do": [],
       "In Progress": [],
       Testing: [],
       Done: [],
     };

     data?.forEach((task) => {
       const { status, ...cardData } = task;
       kanban[status as TaskStatus].push(cardData);
     });

     return kanban;
   }

   export async function createTask(
     projectId: string,
     command: CreateTaskCommand,
     userId: string,
     supabase: SupabaseClient
   ): Promise<TaskDetailsDto> {
     // Calculate next display_order
     const { data: lastTask } = await supabase
       .from("tasks")
       .select("display_order")
       .eq("project_id", projectId)
       .eq("status", "To Do")
       .order("display_order", { ascending: false })
       .limit(1)
       .single();

     const display_order = lastTask ? lastTask.display_order + 1 : 1;

     const { data, error } = await supabase
       .from("tasks")
       .insert({
         project_id: projectId,
         title: command.title,
         description: command.description,
         assignee_id: command.assignee_id,
         milestone_id: command.milestone_id,
         parent_task_id: command.parent_task_id,
         due_date: command.due_date,
         status: "To Do",
         display_order,
       })
       .select()
       .single();

     if (error) throw error;
     return data;
   }

   export async function updateTask(
     taskId: string,
     command: UpdateTaskCommand,
     userId: string,
     supabase: SupabaseClient
   ): Promise<TaskDetailsDto> {
     // Get current task state for history
     const { data: oldTask } = await supabase.from("tasks").select("*").eq("id", taskId).single();

     if (!oldTask) {
       throw new Error("Task not found");
     }

     // Business rule: Can't move parent task to Done if subtasks are incomplete
     if (command.status === "Done" && oldTask.parent_task_id === null) {
       const { data: subtasks } = await supabase
         .from("tasks")
         .select("id, status")
         .eq("parent_task_id", taskId)
         .neq("status", "Done");

       if (subtasks && subtasks.length > 0) {
         throw new Error("Cannot mark parent task as Done while subtasks are incomplete");
       }
     }

     // Update task
     const { data, error } = await supabase.from("tasks").update(command).eq("id", taskId).select().single();

     if (error) throw error;

     // Record changes in history
     await recordTaskHistory(taskId, oldTask, data, userId, supabase);

     return data;
   }

   export async function getTaskHistory(taskId: string, supabase: SupabaseClient): Promise<TaskHistoryDto[]> {
     const { data, error } = await supabase
       .from("task_history")
       .select("id, user_id, changed_field, old_value, new_value, changed_at")
       .eq("task_id", taskId)
       .order("changed_at", { ascending: false });

     if (error) throw error;
     return data || [];
   }

   export async function getTaskById(taskId: string, supabase: SupabaseClient): Promise<TaskDetailsDto | null> {
     const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single();

     if (error) {
       if (error.code === "PGRST116") return null;
       throw error;
     }

     return data;
   }

   async function recordTaskHistory(
     taskId: string,
     oldTask: any,
     newTask: any,
     userId: string,
     supabase: SupabaseClient
   ) {
     const changes: Array<{
       task_id: string;
       user_id: string;
       changed_field: string;
       old_value: string | null;
       new_value: string | null;
     }> = [];

     const fieldsToTrack = [
       "title",
       "description",
       "status",
       "assignee_id",
       "milestone_id",
       "due_date",
       "display_order",
     ];

     fieldsToTrack.forEach((field) => {
       if (oldTask[field] !== newTask[field]) {
         changes.push({
           task_id: taskId,
           user_id: userId,
           changed_field: field,
           old_value: oldTask[field]?.toString() || null,
           new_value: newTask[field]?.toString() || null,
         });
       }
     });

     if (changes.length > 0) {
       await supabase.from("task_history").insert(changes);
     }
   }
   ```

### Faza 3: API Endpoints - Projects

8. **Implementacja `src/pages/api/projects/[projectId]/index.ts`**

   ```typescript
   import type { APIRoute } from "astro";
   import { z } from "zod";
   import * as projectsService from "@/api/services/projects.service";
   import { projectIdParamSchema } from "@/api/validation/projects.schemas";

   export const prerender = false;

   export const GET: APIRoute = async ({ params, locals }) => {
     try {
       // 1. Check authentication
       const user = locals.user;
       if (!user) {
         return new Response(JSON.stringify({ error: "Unauthorized" }), {
           status: 401,
           headers: { "Content-Type": "application/json" },
         });
       }

       // 2. Validate params
       const validation = projectIdParamSchema.safeParse(params);
       if (!validation.success) {
         return new Response(JSON.stringify({ error: "Invalid project ID" }), {
           status: 400,
           headers: { "Content-Type": "application/json" },
         });
       }

       const { projectId } = validation.data;
       const supabase = locals.supabase;

       // 3. Check project membership
       const isMember = await projectsService.isProjectMember(projectId, user.id, supabase);

       if (!isMember) {
         return new Response(JSON.stringify({ error: "Access denied" }), {
           status: 403,
           headers: { "Content-Type": "application/json" },
         });
       }

       // 4. Get project
       const project = await projectsService.getProjectById(projectId, supabase);

       if (!project) {
         return new Response(JSON.stringify({ error: "Project not found" }), {
           status: 404,
           headers: { "Content-Type": "application/json" },
         });
       }

       // 5. Return project
       return new Response(JSON.stringify(project), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       console.error("Error fetching project:", error);
       return new Response(JSON.stringify({ error: "Internal server error" }), {
         status: 500,
         headers: { "Content-Type": "application/json" },
       });
     }
   };
   ```

### Faza 4: API Endpoints - Project Members

9. **Implementacja `src/pages/api/projects/[projectId]/members/index.ts`**
   - GET: Lista członków (użyj `membersService.getProjectMembers`)
   - POST: Dodanie członka (walidacja `addProjectMemberSchema`, sprawdzenie uprawnień managera)

10. **Implementacja `src/pages/api/projects/[projectId]/members/[userId].ts`**
    - DELETE: Usunięcie członka (sprawdzenie uprawnień managera)

### Faza 5: API Endpoints - Milestones

11. **Implementacja `src/pages/api/projects/[projectId]/milestones/index.ts`**
    - GET: Lista kamieni milowych
    - POST: Utworzenie kamienia milowego (walidacja `createMilestoneSchema`, sprawdzenie uprawnień)

### Faza 6: API Endpoints - Tasks

12. **Implementacja `src/pages/api/projects/[projectId]/tasks/index.ts`**
    - GET: Lista zadań w formacie Kanban (walidacja query params, użyj `tasksService.getProjectTasks`)
    - POST: Utworzenie zadania (walidacja `createTaskSchema`)

13. **Implementacja `src/pages/api/tasks/[taskId]/index.ts`**
    - PATCH: Aktualizacja zadania (walidacja `updateTaskSchema`, sprawdzenie reguł biznesowych)

14. **Implementacja `src/pages/api/tasks/[taskId]/history.ts`**
    - GET: Historia zmian zadania

### Faza 7: Testowanie i walidacja

15. **Testowanie manualne**
    - Użyj narzędzia jak Postman lub napisz skrypt `test-endpoint.sh`
    - Przetestuj każdy endpoint z różnymi scenariuszami:
      - Happy path (200/201/204)
      - Brak uwierzytelnienia (401)
      - Brak uprawnień (403)
      - Nieprawidłowe dane (400)
      - Nieistniejące zasoby (404)

16. **Testowanie automatyczne (opcjonalne)**
    - Napisz testy jednostkowe dla services (Vitest)
    - Napisz testy integracyjne dla endpoints (Vitest + Supabase test instance)
    - Napisz testy E2E (Playwright) dla kluczowych user flows

17. **Code review i optymalizacja**
    - Sprawdź wszystkie endpoints pod kątem bezpieczeństwa
    - Zweryfikuj czy wszystkie błędy są odpowiednio obsługiwane
    - Sprawdź wydajność queries (użyj Supabase dashboard do analizy)
    - Upewnij się, że wszystkie DTOs są używane poprawnie

### Faza 8: Dokumentacja i deployment

18. **Aktualizacja dokumentacji**
    - Uzupełnij README.md o informacje o nowych endpoints
    - Dodaj przykłady użycia API
    - Zaktualizuj diagramy architektury (jeśli istnieją)

19. **Deployment checklist**
    - Wszystkie migracje bazy danych uruchomione na produkcji
    - Environment variables skonfigurowane
    - CORS headers skonfigurowane poprawnie
    - Rate limiting skonfigurowane (jeśli stosowane)
    - Monitoring i logging skonfigurowane
    - Backup bazy danych skonfigurowany

20. **Post-deployment monitoring**
    - Monitoruj logi pod kątem błędów
    - Sprawdź wydajność endpoints (response times)
    - Monitoruj użycie zasobów bazy danych
    - Zbieraj feedback od użytkowników

---

## Dodatkowe uwagi

### Helper Functions

Rozważ utworzenie helper functions w `src/api/utils.ts`:

```typescript
import type { APIContext } from "astro";

export function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number = 500) {
  return jsonResponse({ error: message }, status);
}

export function requireAuth(context: APIContext) {
  const user = context.locals.user;
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

### Middleware Enhancement

Rozważ rozszerzenie middleware o:

- Request logging
- Rate limiting per user
- Request ID generation dla tracingu

### Database Triggers

Upewnij się, że triggery `updated_at` są utworzone dla tabel:

- projects
- milestones
- tasks
- users

### Future Enhancements

1. **Pagination**: Dodaj paginację do wszystkich list endpoints
2. **Sorting**: Dodaj możliwość sortowania wyników
3. **Bulk Operations**: Endpoint do bulk update tasks (np. zmiana statusu wielu zadań)
4. **Webhooks**: System webhooków dla integracji zewnętrznych
5. **Real-time Updates**: Supabase Realtime dla live updates na Kanban board
6. **File Attachments**: Dodanie możliwości załączania plików do zadań
7. **Comments**: System komentarzy do zadań
8. **Notifications**: System powiadomień o zmianach w projektach

---

Ten plan wdrożenia zapewnia kompleksową mapę drogową dla zespołu programistów. Kluczowe jest metodyczne podejście do każdej fazy, staranne testowanie oraz dbałość o bezpieczeństwo i wydajność na każdym etapie implementacji.
